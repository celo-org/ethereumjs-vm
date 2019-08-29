'use strict';

var utils = require('ethereumjs-util');
var BN = utils.BN;
var error = require('../../exceptions.js').ERROR;
var assert = require('assert');

module.exports = function (opts) {
  assert(opts.data);

  var results = {};

  results.gasUsed = new BN(1050);
  if (opts.gasLimit.lt(results.gasUsed)) {
    results.return = Buffer.alloc(0);
    results.gasUsed = opts.gasLimit;
    results.exceptionError = error.OUT_OF_GAS;
    results.exception = 0; // 0 means VM fail (in this case because of OOG)
    return results;
  }

  var aNumerator = new BN(opts.data.slice(0, 32));
  var aDenominator = new BN(opts.data.slice(32, 64));
  var bNumerator = new BN(opts.data.slice(64, 96));
  var bDenominator = new BN(opts.data.slice(96, 128));
  var exponent = new BN(opts.data.slice(128, 160));
  var decimals = new BN(opts.data.slice(160, 192));

  if (aDenominator.isZero() || bDenominator.isZero()) {
    results.return = Buffer.alloc(0);
    results.exceptionError = error.REVERT;
    results.exception = 0;
    return results;
  }

  var numeratorExp = aNumerator.mul(bNumerator.pow(exponent));
  var denominatorExp = aDenominator.mul(bDenominator.pow(exponent));

  var decimalAdjustment = new BN(10).pow(decimals);

  var numeratorDecimalAdjusted = numeratorExp.mul(decimalAdjustment).div(denominatorExp);
  var denominatorDecimalAdjusted = decimalAdjustment;

  var numeratorBuf = numeratorDecimalAdjusted.toArrayLike(Buffer, 'be', 32);
  var denominatorBuf = denominatorDecimalAdjusted.toArrayLike(Buffer, 'be', 32);

  var numeratorPadded = utils.setLength(numeratorBuf, 32);
  var denominatorPadded = utils.setLength(denominatorBuf, 32);

  results.return = Buffer.concat([numeratorPadded, denominatorPadded]);
  results.exception = 1;

  return results;
};