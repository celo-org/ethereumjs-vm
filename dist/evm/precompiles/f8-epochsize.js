'use strict';

var utils = require('ethereumjs-util');
var BN = utils.BN;
var error = require('../../exceptions.js').ERROR;
var assert = require('assert');

module.exports = function (opts) {
  var results = {};
  results.gasUsed = new BN(1000);
  if (opts.gasLimit.lt(results.gasUsed)) {
    results.return = Buffer.alloc(0);
    results.gasUsed = opts.gasLimit;
    results.exceptionError = error.OUT_OF_GAS;
    results.exception = 0; // 0 means VM fail (in this case because of OOG)
    return results;
  }

  var sizeBuf = new BN(100).toArrayLike(Buffer, 'be', 32);
  var sizePadded = utils.setLength(sizeBuf, 32);
  results.return = sizePadded;
  results.exception = 1;
  return results;
};