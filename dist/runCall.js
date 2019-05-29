"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ethereumjs_util_1 = require("ethereumjs-util");
var txContext_1 = require("./evm/txContext");
var message_1 = require("./evm/message");
var interpreter_1 = require("./evm/interpreter");
var Block = require('ethereumjs-block');
/**
 * @ignore
 */
function runCall(opts, cb) {
    var block = opts.block || new Block();
    var txContext = new txContext_1.default(opts.gasPrice || Buffer.alloc(0), opts.origin || opts.caller || ethereumjs_util_1.zeros(32));
    var message = new message_1.default({
        caller: opts.caller,
        gasLimit: opts.gasLimit ? new BN(opts.gasLimit) : new BN(0xffffff),
        to: opts.to && opts.to.toString('hex') !== '' ? opts.to : undefined,
        value: opts.value,
        data: opts.data,
        code: opts.code,
        depth: opts.depth || 0,
        isCompiled: opts.compiled || false,
        isStatic: opts.static || false,
        salt: opts.salt || null,
        selfdestruct: opts.selfdestruct || {},
        delegatecall: opts.delegatecall || false,
    });
    var interpreter = new interpreter_1.default(this, txContext, block);
    interpreter
        .executeMessage(message)
        .then(function (results) { return cb(null, results); })
        .catch(function (err) { return cb(err, null); });
}
exports.default = runCall;
//# sourceMappingURL=runCall.js.map