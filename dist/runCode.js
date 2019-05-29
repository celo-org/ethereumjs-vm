"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*

This is the core of the Ethereum Virtual Machine (EVM or just VM).

NOTES:

stack items are lazily duplicated.
So you must never directly change a buffer from the stack,
instead you should `copy` it first

not all stack items are 32 bytes, so if the operation realies on the stack
item length then you must use utils.pad(<item>, 32) first.
*/
var ethereumjs_util_1 = require("ethereumjs-util");
var txContext_1 = require("./evm/txContext");
var message_1 = require("./evm/message");
var interpreter_1 = require("./evm/interpreter");
var Block = require('ethereumjs-block');
/**
 * @ignore
 */
function runCode(opts, cb) {
    if (!opts.block) {
        opts.block = new Block();
    }
    // Backwards compatibility
    if (!opts.txContext) {
        opts.txContext = new txContext_1.default(opts.gasPrice || Buffer.alloc(0), opts.origin || opts.caller || ethereumjs_util_1.zeros(32));
    }
    if (!opts.message) {
        opts.message = new message_1.default({
            code: opts.code,
            data: opts.data,
            gasLimit: opts.gasLimit,
            to: opts.address || ethereumjs_util_1.zeros(32),
            caller: opts.caller,
            value: opts.value,
            depth: opts.depth || 0,
            selfdestruct: opts.selfdestruct || {},
            isStatic: opts.isStatic || false,
        });
    }
    var interpreter = opts.interpreter;
    if (!interpreter) {
        interpreter = new interpreter_1.default(this, opts.txContext, opts.block);
    }
    interpreter
        .runLoop(opts.message, { pc: opts.pc })
        .then(function (res) { return cb(null, res); })
        .catch(function (err) { return cb(err, null); });
}
exports.default = runCode;
//# sourceMappingURL=runCode.js.map