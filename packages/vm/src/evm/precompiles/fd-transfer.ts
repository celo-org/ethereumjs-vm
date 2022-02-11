import BN = require('bn.js')
import { PrecompileInput } from './types'
import { OOGResult, ExecResult } from '../evm'
import { StateManager } from '../../state/interface'
import { Address } from 'ethereumjs-util'
const assert = require('assert')

async function incrementBalance(stateManager: StateManager, address: Address, delta: BN) {
  const account = await stateManager.getAccount(address)
  account.balance = new BN(account.balance).add(delta)
  await stateManager.putAccount(address, account)
}

export default async function (opts: PrecompileInput): Promise<ExecResult> {
  assert(opts.data)

  // TODO(asa): Pick an appropriate gas amount
  const gasUsed = new BN(20)
  if (opts.gasLimit.lt(gasUsed)) {
    return OOGResult(opts.gasLimit)
  }

  // data is the ABI encoding for [address,address,uint256]
  // 32 bytes each, but the addresses only use 20 bytes.
  const fromAddress = new Address(opts.data.slice(12, 32))
  const toAddress = new Address(opts.data.slice(44, 64))
  const value = new BN(opts.data.slice(64, 96))

  await incrementBalance(opts._VM.stateManager, fromAddress, value.neg())
  await incrementBalance(opts._VM.stateManager, toAddress, value)
  return {
    gasUsed,
    returnValue: Buffer.alloc(0),
  }
}
