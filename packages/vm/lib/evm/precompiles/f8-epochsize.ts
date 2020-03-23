import BN = require('bn.js')
import { PrecompileInput } from './types'
import { OOGResult, ExecResult } from '../evm'
import { setLengthLeft } from 'ethereumjs-util'

export default function(opts: PrecompileInput): ExecResult {
  const gasUsed = new BN(1000)
  if (opts.gasLimit.lt(gasUsed)) {
    return OOGResult(opts.gasLimit)
  }

  const sizeBuf = new BN(100).toArrayLike(Buffer, 'be', 32)
  return {
    returnValue: setLengthLeft(sizeBuf, 32),
    gasUsed,
  }
}
