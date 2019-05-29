"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ethereumjs_util_1 = require("ethereumjs-util");
var types_1 = require("./types");
var assert = require('assert');
function default_1(opts) {
    assert(opts.data);
    var gasUsed = new BN(opts._common.param('gasPrices', 'ecRecover'));
    if (opts.gasLimit.lt(gasUsed)) {
        return types_1.OOGResult(opts.gasLimit);
    }
    var data = ethereumjs_util_1.setLengthRight(opts.data, 128);
    var msgHash = data.slice(0, 32);
    var v = data.slice(32, 64);
    var r = data.slice(64, 96);
    var s = data.slice(96, 128);
    var publicKey;
    try {
        publicKey = ethereumjs_util_1.ecrecover(msgHash, new BN(v).toNumber(), r, s);
    }
    catch (e) {
        return {
            gasUsed: gasUsed,
            return: Buffer.alloc(0),
            exception: 1,
        };
    }
    return {
        gasUsed: gasUsed,
        return: ethereumjs_util_1.setLengthLeft(ethereumjs_util_1.publicToAddress(publicKey), 32),
        exception: 1,
    };
}
exports.default = default_1;
//# sourceMappingURL=01-ecrecover.js.map