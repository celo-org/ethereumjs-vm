import BN = require('bn.js')
import Account from 'ethereumjs-account'
import { OOGResult, PrecompileInput, PrecompileResult } from './types'
const assert = require('assert')

export default async function(opts: PrecompileInput): Promise<PrecompileResult> {
  assert(opts.data)

  // TODO(asa): Pick an appropriate gas amount
  const gasUsed = new BN(20)
  if (opts.gasLimit.lt(gasUsed)) {
    return OOGResult(opts.gasLimit)
  }

  const fromAddress = opts.data.slice(0, 32)
  const toAddress = opts.data.slice(32, 64)
  const value = new BN(opts.data.slice(64, 96))

  const fromAcc: Account = await opts.stateManager.getAccount(fromAddress)
  fromAcc.balance = new BN(fromAcc.balance).sub(value).toBuffer()
  await opts.stateManager.putAccount(fromAddress, fromAcc)

  const toAcc: Account = await opts.stateManager.getAccount(toAddress)
  toAcc.balance = new BN(toAcc.balance).add(value).toBuffer()
  await opts.stateManager.putAccount(toAddress, toAcc)

  return {
    gasUsed,
    return: Buffer.alloc(0),
    exception: 1,
  }
}
