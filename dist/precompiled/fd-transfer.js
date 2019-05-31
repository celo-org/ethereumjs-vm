'use strict';

var utils = require('ethereumjs-util');
var BN = utils.BN;
var error = require('../exceptions.js').ERROR;
var assert = require('assert');

module.exports = function (opts, cb) {
  assert(opts.data);

  var results = {};

  // TODO(asa): Pick an appropriate gas amount
  results.gasUsed = new BN(20);
  if (opts.gasLimit.lt(results.gasUsed)) {
    results.return = Buffer.alloc(0);
    results.gasUsed = opts.gasLimit;
    results.exceptionError = error.OUT_OF_GAS;
    results.exception = 0; // 0 means VM fail (in this case because of OOG)
    cb(error.OUT_OF_GAS, results);
    return;
  }

  var from = new BN(opts.data.slice(0, 32));
  var to = new BN(opts.data.slice(32, 64));
  var value = new BN(opts.data.slice(64, 96));
  var incrementBalance = function incrementBalance(address, delta, callback) {
    opts.stateManager.getAccountBalance(address, function (err, balance) {
      if (err) {
        callback(err);
      } else {
        var newBalance = new BN(balance).add(delta);
        opts.stateManager.putAccountBalance(address, newBalance, function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      }
    });
  };

  var failIfErr = function failIfErr(err) {
    if (err) {
      results.return = Buffer.alloc(0);
      results.exception = 0;
      cb(err, results);
    }
  };

  incrementBalance(from, value.neg(), function (err) {
    failIfErr(err);
    if (!err) {
      incrementBalance(to, value, function (err) {
        failIfErr(err);
        if (!err) {
          results.return = true;
          results.exception = 1;
          cb(err, results);
        }
      });
    }
  });
};