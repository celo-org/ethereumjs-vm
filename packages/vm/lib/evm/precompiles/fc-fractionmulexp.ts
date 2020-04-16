import BN = require('bn.js')
import { PrecompileInput } from './types'
import { OOGResult, ExecResult } from '../evm'
import { VmError, ERROR } from '../../exceptions'
import { setLengthLeft } from 'ethereumjs-util'
const assert = require('assert')

export default function(opts: PrecompileInput): ExecResult {
  const gasUsed = new BN(1050)
  assert(opts.data)

  var results = {}

  if (opts.gasLimit.lt(gasUsed)) {
    return OOGResult(opts.gasLimit)
  }

  const aNumerator = new BN(opts.data.slice(0, 32))
  const aDenominator = new BN(opts.data.slice(32, 64))
  const bNumerator = new BN(opts.data.slice(64, 96))
  const bDenominator = new BN(opts.data.slice(96, 128))
  const exponent = new BN(opts.data.slice(128, 160))
  const decimals = new BN(opts.data.slice(160, 192))

  if (aDenominator.isZero() || bDenominator.isZero()) {
    return {
      returnValue: Buffer.alloc(0),
      gasUsed: opts.gasLimit,
      exceptionError: new VmError(ERROR.REVERT),
    }
  }

  const numeratorExp = aNumerator.mul(bNumerator.pow(exponent))
  const denominatorExp = aDenominator.mul(bDenominator.pow(exponent))

  const decimalAdjustment = new BN(10).pow(decimals)

  const numeratorDecimalAdjusted = numeratorExp.mul(decimalAdjustment).div(denominatorExp)
  const denominatorDecimalAdjusted = decimalAdjustment

  const numeratorBuf = numeratorDecimalAdjusted.toArrayLike(Buffer, 'be', 32)
  const denominatorBuf = denominatorDecimalAdjusted.toArrayLike(Buffer, 'be', 32)

  const numeratorPadded = setLengthLeft(numeratorBuf, 32)
  const denominatorPadded = setLengthLeft(denominatorBuf, 32)

  const returnValue = Buffer.concat([numeratorPadded, denominatorPadded])

  return { returnValue, gasUsed }
}
