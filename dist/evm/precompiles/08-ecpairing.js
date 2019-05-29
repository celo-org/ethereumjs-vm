"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var types_1 = require("./types");
var assert = require('assert');
var bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    var inputData = opts.data;
    // no need to care about non-divisible-by-192, because bn128.pairing will properly fail in that case
    var inputDataSize = Math.floor(inputData.length / 192);
    var gasUsed = new BN(opts._common.param('gasPrices', 'ecPairing') +
        inputDataSize * opts._common.param('gasPrices', 'ecPairingWord'));
    if (opts.gasLimit.lt(gasUsed)) {
        return types_1.OOGResult(opts.gasLimit);
    }
    var returnData = bn128.pairing(inputData);
    // check ecpairing success or failure by comparing the output length
    if (returnData.length !== 32) {
        return types_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed: gasUsed,
        return: returnData,
        exception: 1,
    };
}
exports.default = default_1;
//# sourceMappingURL=08-ecpairing.js.map