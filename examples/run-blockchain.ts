// The example does these things:
//
// 1. Instantiates a VM and a Blockchain
// 2. Creates the accounts from ../utils/blockchain-mock-data "pre" attribute
// 3. Creates a genesis block
// 4. Puts the blocks from ../utils/blockchain-mock-data "blocks" attribute into the Blockchain
// 5. Runs the Blockchain on the VM.

import { Account, Address, toBuffer, setLengthLeft } from 'ethereumjs-util'
import { Block } from '@ethereumjs/block'
import Blockchain from '@ethereumjs/blockchain'
import Common, { ConsensusType } from '@ethereumjs/common'
import VM from '../'
import { testData } from './helpers/blockchain-mock-data'
const level = require('level')

async function main() {
  const common = new Common({ chain: 1, hardfork: testData.network.toLowerCase() })
  const validatePow = common.consensusType() === ConsensusType.ProofOfWork
  const validateBlocks = true

  const blockchain = await Blockchain.create({
    common,
    validateConsensus: validatePow,
    validateBlocks,
    genesisBlock: getGenesisBlock(common),
  })

  // When verifying PoW, setting this cache improves the
  // performance of subsequent runs of this script.
  // Note that this optimization is a bit hacky and might
  // not be working in the future though. :-)
  if (validatePow) {
    blockchain._ethash!.cacheDB = level('./.cachedb')
  }

  const vm = new VM({ blockchain, common })

  await setupPreConditions(vm, testData)

  await putBlocks(blockchain, common, testData)

  await vm.runBlockchain(blockchain)

  const blockchainHead = await vm.blockchain.getHead()

  console.log('--- Finished processing the BlockChain ---')
  console.log('New head:', '0x' + blockchainHead.hash().toString('hex'))
  console.log('Expected:', testData.lastblockhash)
}

async function setupPreConditions(vm: VM, testData: any) {
  await vm.stateManager.checkpoint()

  for (const addr of Object.keys(testData.pre)) {
    const { nonce, balance, storage, code } = testData.pre[addr]

    const address = new Address(Buffer.from(addr.slice(2), 'hex'))
    const account = Account.fromAccountData({ nonce, balance })
    await vm.stateManager.putAccount(address, account)

    for (const hexStorageKey of Object.keys(storage)) {
      const val = Buffer.from(storage[hexStorageKey], 'hex')
      const storageKey = setLengthLeft(Buffer.from(hexStorageKey, 'hex'), 32)

      await vm.stateManager.putContractStorage(address, storageKey, val)
    }

    const codeBuf = Buffer.from(code.slice(2), 'hex')

    await vm.stateManager.putContractCode(address, codeBuf)
  }

  await vm.stateManager.commit()
}

function getGenesisBlock(common: Common) {
  const header = testData.genesisBlockHeader
  const genesis = Block.genesis({ header }, { common })
  return genesis
}

async function putBlocks(blockchain: any, common: Common, testData: any) {
  for (const blockData of testData.blocks) {
    const blockRlp = toBuffer(blockData.rlp)
    const block = Block.fromRLPSerializedBlock(blockRlp, { common })
    await blockchain.putBlock(block)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
