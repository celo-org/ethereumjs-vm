"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const evm_1 = require("../evm");
const ethereumjs_util_1 = require("ethereumjs-util");
function default_1(opts) {
    const gasUsed = new BN(1000);
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    const sizeBuf = new BN(100).toArrayLike(Buffer, 'be', 32);
    return {
        returnValue: (0, ethereumjs_util_1.setLengthLeft)(sizeBuf, 32),
        gasUsed,
    };
}
exports.default = default_1;
//# sourceMappingURL=f8-epochsize.js.map