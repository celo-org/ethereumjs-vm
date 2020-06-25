'use strict';

var utils = require('ethereumjs-util');
var BN = utils.BN;
var error = require('../../exceptions.js').ERROR;
// var assert = require('assert');

module.exports = function (opts) {
  var results = {};
  results.gasUsed = new BN(1050);
  if (opts.gasLimit.lt(results.gasUsed)) {
    results.return = Buffer.alloc(0);
    results.gasUsed = opts.gasLimit;
    results.exceptionError = error.OUT_OF_GAS;
    results.exception = 0; // 0 means VM fail (in this case because of OOG)
    return results;
  }

  results.return = Buffer.from("33668b53057a37a1681926b05d40441e92cdc4c227673d04f1f370d3a1d6af3096ec25497d8898c67c70b58313a8870035c5a52ed463fa2637e742dd42fc3cf1661018ff06ff21dd1a8992a217497c8f4245476de570bec10908b08302878a0100", "hex")
  results.exception = 1;
  return results;
};