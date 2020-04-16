import BN = require('bn.js')
import { PrecompileInput } from './types'
import { OOGResult, ExecResult } from '../evm'
import PStateManager from '../../state/promisified'
const assert = require('assert')

async function incrementBalance(stateManager: PStateManager, address: Buffer, delta: BN) {
  const account = await stateManager.getAccount(address)
  account.balance = new BN(account.balance).add(delta).toBuffer()
  await stateManager.putAccount(address, account)
}

export default async function(opts: PrecompileInput): Promise<ExecResult> {
  assert(opts.data)

  // TODO(asa): Pick an appropriate gas amount
  const gasUsed = new BN(20)
  if (opts.gasLimit.lt(gasUsed)) {
    return OOGResult(opts.gasLimit)
  }

  // data is the ABI encoding for [address,address,uint256]
  // 32 bytes each, but the addresses only use 20 bytes.
  const fromAddress = opts.data.slice(12, 32)
  const toAddress = opts.data.slice(44, 64)
  const value = new BN(opts.data.slice(64, 96))

  await incrementBalance(opts._state, fromAddress, value.neg())
  await incrementBalance(opts._state, toAddress, value)
  return {
    gasUsed,
    returnValue: Buffer.alloc(0),
  }
}
