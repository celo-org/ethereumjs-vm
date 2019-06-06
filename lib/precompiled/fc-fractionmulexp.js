const utils = require('ethereumjs-util')
const BN = utils.BN
const error = require('../exceptions.js').ERROR
const assert = require('assert')

module.exports = function (opts) {
  assert(opts.data)
  console.log(`input data: ${new BN(opts.data)}`)
  console.log(`input data type: ${typeof opts.data}`)

  var results = {}

  results.gasUsed = new BN(3000)
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

  // const aNumerator = new BN(opts.data.slice(0, 64))
  // const aDenominator = new BN(opts.data.slice(64, 128))
  // const bNumerator = new BN(opts.data.slice(128, 192))
  // const bDenominator = new BN(opts.data.slice(192, 256))
  // const exponent = new BN(opts.data.slice(256, 320))
  // const decimals = new BN(opts.data.slice(320, 384))

  console.log(`data length is ${opts.data.length}`)
  console.log(aNumerator, aDenominator, bNumerator, bDenominator, exponent, decimals)

  const numeratorExp = aNumerator.mul(bNumerator.pow(exponent))
  const denominatorExp = aDenominator.mul(bDenominator.pow(exponent))

  const numerator = numeratorExp.div(denominatorExp).mul((new BN(10)).pow(decimals))
  const denominator = (new BN(10)).pow(decimals)

  console.log('NUMERATOREXP, DENOMINATOREXP:')
  console.log(numeratorExp, denominatorExp)
  console.log('NUMERATOR, DENOMINATOR:')
  console.log(numerator, denominator)

  var numeratorBuf = numerator.toArrayLike(Buffer, 'be', 32)
  var denominatorBuf = denominator.toArrayLike(Buffer, 'be', 32)

  var numeratorPadded = utils.setLength(numeratorBuf, 32)
  var denominatorPadded = utils.setLength(denominatorBuf, 32)

  results.return = Buffer.concat([numeratorPadded, denominatorPadded])
  results.exception = 1

  return results
}
