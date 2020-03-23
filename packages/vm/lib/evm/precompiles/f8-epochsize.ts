import BN = require('bn.js')
import { PrecompileInput } from './types'
import { OOGResult, ExecResult } from '../evm'

export default function(opts: PrecompileInput): ExecResult {
  const gasUsed = new BN(1000)
  if (opts.gasLimit.lt(gasUsed)) {
    return OOGResult(opts.gasLimit)
  }

  const sizeBuf = new BN(100).toArrayLike(Buffer, 'be', 32)
  return {
    returnValue: utils.setLength(sizeBuf, 32),
    gasUsed
  }
}
