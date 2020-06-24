import BN = require('bn.js')
import { PrecompileInput } from './types'
import { OOGResult, ExecResult } from '../evm'
const assert = require('assert')

export default function(opts: PrecompileInput): ExecResult {
  assert(opts.data)

  // TODO(lucas): Pick an appropriate gas amount
  const gasUsed = new BN(500)
  if (opts.gasLimit.lt(gasUsed)) {
    return OOGResult(opts.gasLimit)
  }

  assert.equal(
    opts.data,
    "test"
  )
  return {
    gasUsed,
    returnValue: Buffer.from("33668b53057a37a1681926b05d40441e92cdc4c227673d04f1f370d3a1d6af3096ec25497d8898c67c70b58313a8870035c5a52ed463fa2637e742dd42fc3cf1661018ff06ff21dd1a8992a217497c8f4245476de570bec10908b08302878a0100", "hex")
  }
}