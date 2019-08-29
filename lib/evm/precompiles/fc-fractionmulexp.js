const utils = require('ethereumjs-util')
const BN = utils.BN
const error = require('../../exceptions.js').ERROR
const assert = require('assert')

module.exports = function (opts) {
  assert(opts.data)

  var results = {}

  results.gasUsed = new BN(1050)
  if (opts.gasLimit.lt(results.gasUsed)) {
    results.return = Buffer.alloc(0)
    results.gasUsed = opts.gasLimit
    results.exceptionError = error.OUT_OF_GAS
    results.exception = 0 // 0 means VM fail (in this case because of OOG)
    return results
  }

  const aNumerator = new BN(opts.data.slice(0, 32))
  const aDenominator = new BN(opts.data.slice(32, 64))
  const bNumerator = new BN(opts.data.slice(64, 96))
  const bDenominator = new BN(opts.data.slice(96, 128))
  const exponent = new BN(opts.data.slice(128, 160))
  const decimals = new BN(opts.data.slice(160, 192))

  if (aDenominator.isZero() || bDenominator.isZero()) {
    results.return = Buffer.alloc(0)
    results.exceptionError = error.REVERT
    results.exception = 0
    return results
  }

  const numeratorExp = aNumerator.mul(bNumerator.pow(exponent))
  const denominatorExp = aDenominator.mul(bDenominator.pow(exponent))

  const decimalAdjustment = new BN(10).pow(decimals)

  const numeratorDecimalAdjusted = numeratorExp
    .mul(decimalAdjustment)
    .div(denominatorExp)
  const denominatorDecimalAdjusted = decimalAdjustment

  var numeratorBuf = numeratorDecimalAdjusted.toArrayLike(Buffer, 'be', 32)
  var denominatorBuf = denominatorDecimalAdjusted.toArrayLike(Buffer, 'be', 32)

  var numeratorPadded = utils.setLength(numeratorBuf, 32)
  var denominatorPadded = utils.setLength(denominatorBuf, 32)

  results.return = Buffer.concat([numeratorPadded, denominatorPadded])
  results.exception = 1

  return results
}
