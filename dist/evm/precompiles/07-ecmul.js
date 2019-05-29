"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var types_1 = require("./types");
var assert = require('assert');
var bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    var inputData = opts.data;
    var gasUsed = new BN(opts._common.param('gasPrices', 'ecMul'));
    if (opts.gasLimit.lt(gasUsed)) {
        return types_1.OOGResult(opts.gasLimit);
    }
    var returnData = bn128.mul(inputData);
    // check ecmul success or failure by comparing the output length
    if (returnData.length !== 64) {
        return types_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed: gasUsed,
        return: returnData,
        exception: 1,
    };
}
exports.default = default_1;
//# sourceMappingURL=07-ecmul.js.map