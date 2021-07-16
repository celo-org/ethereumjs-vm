import BN = require('bn.js')
import { setLengthLeft, toBuffer, zeros } from 'ethereumjs-util'
import Account from 'ethereumjs-account'
import { Transaction } from 'ethereumjs-tx'
import VM from './index'
import Bloom from './bloom'
import { default as EVM, EVMResult } from './evm/evm'
import Message from './evm/message'
import TxContext from './evm/txContext'

const Block = require('ethereumjs-block')

const REGISTRY_CONTRACT_ADDRESS = "0x000000000000000000000000000000000000ce10";

/**
 * Options for the `runTx` method.
 */
export interface RunTxOpts {
  /**
   * The block to which the `tx` belongs
   */
  block?: any
  /**
   * A [`Transaction`](https://github.com/ethereum/ethereumjs-tx) to run
   */
  tx: Transaction
  /**
   * If true, skips the nonce check
   */
  skipNonce?: boolean
  /**
   * If true, skips the balance check
   */
  skipBalance?: boolean
}

/**
 * Execution result of a transaction
 */
export interface RunTxResult extends EVMResult {
  /**
   * Bloom filter resulted from transaction
   */
  bloom: Bloom
  /**
   * The amount of ether used by this transaction
   */
  amountSpent: BN
  /**
   * The amount of gas as that was refunded during the transaction (i.e. `gasUsed = totalGasConsumed - gasRefund`)
   */
  gasRefund?: BN
}

/**
 * @ignore
 */
export default async function runTx(this: VM, opts: RunTxOpts): Promise<RunTxResult> {
  if (opts === undefined) {
    throw new Error('invalid input, opts must be provided')
  }

  // tx is required
  if (!opts.tx) {
    throw new Error('invalid input, tx is required')
  }

  // create a reasonable default if no block is given
  if (!opts.block) {
    opts.block = new Block()
  }

  if (new BN(opts.block.header.gasLimit).lt(new BN(opts.tx.gasLimit))) {
    throw new Error('tx has a higher gas limit than the block')
  }

  const state = this.pStateManager

  await state.checkpoint()

  try {
    const result = await _runTx.bind(this)(opts)
    await state.commit()
    return result
  } catch (e) {
    await state.revert()
    throw e
  }
}

const getEncodedAbi = (methodSelector: string, params: Buffer[]): Buffer => {
  const buf = Buffer.alloc(4 + params.length * 32, 0);
  buf.write(methodSelector, "hex");
  for (let i = 0; i < params.length; i++) {
    const padded = setLengthLeft(params[i], 32);
    padded.copy(buf, 4 + i * 32);
  }
  return buf;
};

async function _runTx(this: VM, opts: RunTxOpts): Promise<RunTxResult> {
  const block = opts.block
  const tx = opts.tx
  const state = this.pStateManager

  /**
   * The `beforeTx` event
   *
   * @event Event: beforeTx
   * @type {Object}
   * @property {Transaction} tx emits the Transaction that is about to be processed
   */
  await this._emit('beforeTx', tx)

  // Validate gas limit against base fee
  const baseFee = tx.getBaseFee()
  const gasLimit = new BN(tx.gasLimit)
  if (gasLimit.lt(baseFee)) {
    throw new Error('base fee exceeds gas limit')
  }

  gasLimit.isub(baseFee)

  let fromAccount = await state.getAccount(tx.getSenderAddress())
  if (!opts.skipBalance && new BN(fromAccount.balance).lt(tx.getUpfrontCost())) {
    throw new Error(
      `sender doesn't have enough funds to send tx. The upfront cost is: ${tx
        .getUpfrontCost()
        .toString()}` +
        ` and the sender's account only has: ${new BN(fromAccount.balance).toString()}`,
    )
  } else if (!opts.skipNonce && !new BN(fromAccount.nonce).eq(new BN(tx.nonce))) {
    throw new Error(
      `the tx doesn't have the correct nonce. account has nonce of: ${new BN(
        fromAccount.nonce,
      ).toString()} tx has nonce of: ${new BN(tx.nonce).toString()}`,
    )
  }

  let feeVal = new BN(tx.gasLimit).mul(new BN(tx.gasPrice))
  let gasPrice = new BN(tx.gasPrice)
  let gasUsed = new BN(0)

  if (this.minimumGasPrice && gasPrice.gt(new BN(0)) && gasPrice.lt(new BN(this.minimumGasPrice))) {
    throw new Error('gas price for TX is smaller than the minimum gas price')
  }

  // precalculated hashIdentifier: keccak256(abi.encodePacked("StableToken"))
  const getAddressIdentifierHash = 
    toBuffer("0xa676d30f91cbc454bebc9ca2df3e4a03df04d387728c3c700f40e4f04bdb298f");
  const fetchingStableTokenOpts = {
    to: toBuffer(REGISTRY_CONTRACT_ADDRESS),
    caller: zeros(32), // call as root
    data: getEncodedAbi("dd927233", [getAddressIdentifierHash]),
    gasLimit: toBuffer(gasLimit),
    gasPrice: tx.gasPrice
  }
  const fetchingStableTokenResult = await this.runCall(fetchingStableTokenOpts); // value in wei
  const stableTokenAddress = fetchingStableTokenResult.execResult.returnValue
                              .toString("hex")
                              .slice(-40);
  gasUsed = gasUsed.add(fetchingStableTokenResult.gasUsed);
  // pay fees
  if (tx.feeCurrency?.toString('hex') === stableTokenAddress) {
    // TODO (important): check the balance and error out if there arent enough funds
    const balanceOpts = {
      to: tx.feeCurrency,
      caller: zeros(32), // call as root
      data: getEncodedAbi("70a08231", [tx.getSenderAddress()]),
      gasLimit: toBuffer(gasLimit),
      gasPrice: tx.gasPrice
    }
    const balanceResult = await this.runCall(balanceOpts); // value in wei

    // Ensure that tx is not a call
    if (new BN(balanceResult.execResult.returnValue).lt(feeVal)) {
        throw new Error('not enough funds to pay transaction fee')
    }

    // call debitGasFees
    const opts = {
      to: tx.feeCurrency,
      caller: zeros(32), // call as root
      data: getEncodedAbi("58cf9672", [tx.getSenderAddress(), toBuffer(feeVal)]),
      gasLimit: toBuffer(gasLimit),
      gasPrice: tx.gasPrice
    }
    const result = await this.runCall(opts);
    gasUsed = gasUsed.add(result.gasUsed);
  } else {
    fromAccount.balance = toBuffer(
      new BN(fromAccount.balance).sub(feeVal),
    )
  }

  // Update from account's nonce
  fromAccount.nonce = toBuffer(new BN(fromAccount.nonce).addn(1))
  await state.putAccount(tx.getSenderAddress(), fromAccount)

  /*
   * Execute message
   */
  const txContext = new TxContext(tx.gasPrice, tx.getSenderAddress())
  const message = new Message({
    caller: tx.getSenderAddress(),
    gasLimit: gasLimit,
    to: tx.to.toString('hex') !== '' ? tx.to : undefined,
    value: tx.value,
    data: tx.data,
  })
  state._wrapped._clearOriginalStorageCache()
  const evm = new EVM(this, txContext, block)
  const results = (await evm.executeMessage(message)) as RunTxResult

  /*
   * Parse results
   */
  // Generate the bloom for the tx
  results.bloom = txLogsBloom(results.execResult.logs)

  // Caculate the total gas used
  results.gasUsed = results.gasUsed.add(baseFee).add(gasUsed)

  // Process any gas refund
  const gasRefund = evm._refund
  if (gasRefund) {
    if (gasRefund.lt(results.gasUsed.divn(2))) {
      results.gasUsed.isub(gasRefund)
    } else {
      results.gasUsed.isub(results.gasUsed.divn(2))
    }
  }
  results.amountSpent = results.gasUsed.mul(new BN(tx.gasPrice))

  if (tx.feeCurrency?.toString('hex') === stableTokenAddress) {
    // call creditGasFees
    const opts = {
      to: tx.feeCurrency,
      caller: zeros(32), // call as root
      data: getEncodedAbi("6a30b253", [
        tx.getSenderAddress(), // from
        zeros(32), // feeRecipient
        zeros(32), // gatewayFeeRecipient
        zeros(32), // communityFund
        toBuffer(new BN(tx.gasLimit).sub(results.gasUsed).mul(new BN(tx.gasPrice))), // refund
        zeros(32), // tipTxFee,
        zeros(32), // gatewayFee,
        zeros(32), // baseTxFee,
      ]),
      gasLimit: toBuffer(gasLimit),
      gasPrice: tx.gasPrice
    }
    const result = await this.runCall(opts)
    results.gasUsed = results.gasUsed.add(result.gasUsed);
  } else {
    // Update sender's balance
    fromAccount = await state.getAccount(tx.getSenderAddress())
    const finalFromBalance = new BN(tx.gasLimit)
      .sub(results.gasUsed)
      .mul(new BN(tx.gasPrice))
      .add(new BN(fromAccount.balance))
    fromAccount.balance = toBuffer(finalFromBalance)
    await state.putAccount(toBuffer(tx.getSenderAddress()), fromAccount)
  }

  // Update miner's balance
  const minerAccount = await state.getAccount(block.header.coinbase)
  // add the amount spent on gas to the miner's account
  minerAccount.balance = toBuffer(new BN(minerAccount.balance).add(results.amountSpent))
  if (!new BN(minerAccount.balance).isZero()) {
    await state.putAccount(block.header.coinbase, minerAccount)
  }

  /*
   * Cleanup accounts
   */
  if (results.execResult.selfdestruct) {
    const keys = Object.keys(results.execResult.selfdestruct)
    for (const k of keys) {
      await state.putAccount(Buffer.from(k, 'hex'), new Account())
    }
  }
  await state.cleanupTouchedAccounts()

  /**
   * The `afterTx` event
   *
   * @event Event: afterTx
   * @type {Object}
   * @property {Object} result result of the transaction
   */
  await this._emit('afterTx', results)

  return results
}

/**
 * @method txLogsBloom
 * @private
 */
function txLogsBloom(logs?: any[]): Bloom {
  const bloom = new Bloom()
  if (logs) {
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i]
      // add the address
      bloom.add(log[0])
      // add the topics
      const topics = log[1]
      for (let q = 0; q < topics.length; q++) {
        bloom.add(topics[q])
      }
    }
  }
  return bloom
}
