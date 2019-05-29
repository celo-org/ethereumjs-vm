"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exceptions_1 = require("../../exceptions");
function OOGResult(gasLimit) {
    return {
        return: Buffer.alloc(0),
        gasUsed: gasLimit,
        exception: 0,
        exceptionError: exceptions_1.ERROR.OUT_OF_GAS,
    };
}
exports.OOGResult = OOGResult;
//# sourceMappingURL=types.js.map