import { Account, Address, toBuffer, bufferToInt, BN } from 'ethereumjs-util'
import Common from '@ethereumjs/common'
import { Block } from '@ethereumjs/block'
import { StateManager, DefaultStateManager } from '../dist/state'
import { RunBlockResult } from '../dist/runBlock'
import Mockchain from './mockchain'

export interface BenchmarkType {
  [key: string]: Function
}

export interface BenchmarksType {
  [key: string]: BenchmarkType
}

interface StateTestPreAccount {
  balance: string
  code: string
  nonce: string
  storage: { [k: string]: string }
}

export async function getPreState(
  pre: {
    [k: string]: StateTestPreAccount
  },
  common: Common
): Promise<StateManager> {
  const state = new DefaultStateManager({ common })
  await state.checkpoint()
  for (const k in pre) {
    const address = new Address(toBuffer(k))
    const { nonce, balance, code, storage } = pre[k]
    const account = new Account(new BN(hexToBuffer(nonce)), new BN(hexToBuffer(balance)))
    await state.putAccount(address, account)
    await state.putContractCode(address, toBuffer(code))
    for (const sk in storage) {
      const sv = storage[sk]
      const valueBuffer = toBuffer(sv)
      // verify if this value buffer is not a zero buffer. if so, we should not write it...
      const zeroBufferEquivalent = Buffer.alloc(valueBuffer.length, 0)
      if (!zeroBufferEquivalent.equals(valueBuffer)) {
        await state.putContractStorage(address, toBuffer(sk), toBuffer(sv))
      }
    }
  }
  await state.commit()
  return state
}

export function getBlockchain(blockhashes: any): Mockchain {
  let mockchain = new Mockchain()
  for (let hashStr in blockhashes) {
    const bn = new BN(hashStr.substr(2), 'hex')
    const hash = blockhashes[hashStr]
    const hashBuffer = Buffer.from(hash.substr(2), 'hex')
    mockchain.putBlockHash(bn, hashBuffer)
  }
  return mockchain
}

const hexToBuffer = (h: string, allowZero: boolean = false): Buffer => {
  const buf = toBuffer(h)
  if (!allowZero && buf.toString('hex') === '00') {
    return Buffer.alloc(0)
  }
  return buf
}

export const verifyResult = (block: Block, result: RunBlockResult) => {
  // verify the receipt root, the logs bloom and the gas used after block execution,
  // throw if any of these is not the expected value
  if (result.receiptRoot && !result.receiptRoot.equals(block.header.receiptTrie)) {
    // there's something wrong here with the receipts trie.
    // if block has receipt data we can check against the expected result of the block
    // and the reported data of the VM in order to isolate the problem

    // check if there are receipts
    const { receipts } = result
    if (receipts) {
      let cumGasUsed = 0
      for (let index = 0; index < receipts.length; index++) {
        let gasUsedExpected = parseInt(receipts[index].gasUsed.toString('hex'), 16)
        let cumGasUsedActual = parseInt(receipts[index].gasUsed.toString('hex'), 16)
        let gasUsed = cumGasUsedActual - cumGasUsed
        if (gasUsed !== gasUsedExpected) {
          const blockNumber = block.header.number.toNumber()
          console.log(`[DEBUG]
            Transaction at index ${index} of block ${blockNumber}
            did not yield expected gas.
            Gas used expected: ${gasUsedExpected},
            actual: ${gasUsed},
            difference: ${gasUsed - gasUsedExpected}`)
        }
        cumGasUsed = cumGasUsedActual
      }
    }
    throw new Error('invalid receiptTrie')
  }
  if (!result.logsBloom.equals(block.header.logsBloom)) {
    throw new Error('invalid logsBloom')
  }
  if (!block.header.gasUsed.eq(result.gasUsed)) {
    throw new Error('invalid gasUsed')
  }
}
