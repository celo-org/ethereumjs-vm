"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const evm_1 = require("../evm");
const exceptions_1 = require("../../exceptions");
const ethereumjs_util_1 = require("ethereumjs-util");
const assert = require('assert');
function default_1(opts) {
    const gasUsed = new BN(1050);
    assert(opts.data);
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    const aNumerator = new BN(opts.data.slice(0, 32));
    const aDenominator = new BN(opts.data.slice(32, 64));
    const bNumerator = new BN(opts.data.slice(64, 96));
    const bDenominator = new BN(opts.data.slice(96, 128));
    const exponent = new BN(opts.data.slice(128, 160));
    const decimals = new BN(opts.data.slice(160, 192));
    if (aDenominator.isZero() || bDenominator.isZero()) {
        return {
            returnValue: Buffer.alloc(0),
            gasUsed: opts.gasLimit,
            exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.REVERT),
        };
    }
    const numeratorExp = aNumerator.mul(bNumerator.pow(exponent));
    const denominatorExp = aDenominator.mul(bDenominator.pow(exponent));
    const decimalAdjustment = new BN(10).pow(decimals);
    const numeratorDecimalAdjusted = numeratorExp.mul(decimalAdjustment).div(denominatorExp);
    const denominatorDecimalAdjusted = decimalAdjustment;
    const numeratorBuf = numeratorDecimalAdjusted.toArrayLike(Buffer, 'be', 32);
    const denominatorBuf = denominatorDecimalAdjusted.toArrayLike(Buffer, 'be', 32);
    const numeratorPadded = (0, ethereumjs_util_1.setLengthLeft)(numeratorBuf, 32);
    const denominatorPadded = (0, ethereumjs_util_1.setLengthLeft)(denominatorBuf, 32);
    const returnValue = Buffer.concat([numeratorPadded, denominatorPadded]);
    return { returnValue, gasUsed };
}
exports.default = default_1;
//# sourceMappingURL=fc-fractionmulexp.js.map