import { Account, Address, BN } from 'ethereumjs-util'
import Blockchain from '@ethereumjs/blockchain'
import VM from '../../src/index'
import { VMOpts } from '../../src'
import { Block } from '@ethereumjs/block'
import { TransactionFactory } from '@ethereumjs/tx'
import Common from '@ethereumjs/common'

const level = require('level-mem')

export function createAccount(nonce: BN = new BN(0), balance: BN = new BN(0xfff384)) {
  return new Account(nonce, balance)
}

export async function setBalance(vm: VM, address: Address, balance = new BN(100000000)) {
  const account = createAccount(new BN(0), balance)
  await vm.stateManager.checkpoint()
  await vm.stateManager.putAccount(address, account)
  await vm.stateManager.commit()
}

export function setupVM(opts: VMOpts & { genesisBlock?: Block } = {}) {
  const db = level()
  const { common, genesisBlock } = opts
  if (!opts.blockchain) {
    opts.blockchain = new Blockchain({
      db,
      validateBlocks: false,
      validateConsensus: false,
      common,
      genesisBlock,
    })
  }
  return new VM({
    ...opts,
  })
}

export function getTransaction(
  common: Common,
  txType = 0,
  sign = false,
  value = '0x00',
  createContract = false
) {
  let to: string | undefined = '0x0000000000000000000000000000000000000000'
  let data = '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'

  if (createContract) {
    to = undefined
    data =
      '0x6080604052348015600f57600080fd5b50603e80601d6000396000f3fe6080604052600080fdfea265627a7a723158204aed884a44fd1747efccba1447a2aa2d9a4b06dd6021c4a3bbb993021e0a909e64736f6c634300050f0032'
  }

  const txParams: any = {
    nonce: 0,
    gasPrice: 100,
    gasLimit: 90000,
    to,
    value,
    data,
  }

  if (txType > 0) {
    txParams['type'] = txType
  }

  if (txType === 1) {
    txParams['chainId'] = common.chainIdBN()
    txParams['accessList'] = [
      {
        address: '0x0000000000000000000000000000000000000101',
        storageKeys: [
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          '0x00000000000000000000000000000000000000000000000000000000000060a7',
        ],
      },
    ]
  } else if (txType === 2) {
    txParams['gasPrice'] = undefined
    txParams['maxFeePerGas'] = new BN(100)
    txParams['maxPriorityFeePerGas'] = new BN(10)
  }

  const tx = TransactionFactory.fromTxData(txParams, { common })

  if (sign) {
    const privateKey = Buffer.from(
      'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
      'hex'
    )
    return tx.sign(privateKey)
  }

  return tx
}
