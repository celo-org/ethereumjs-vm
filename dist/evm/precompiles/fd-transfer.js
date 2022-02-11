"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const evm_1 = require("../evm");
const ethereumjs_util_1 = require("ethereumjs-util");
const assert = require('assert');
async function incrementBalance(stateManager, address, delta) {
    const account = await stateManager.getAccount(address);
    account.balance = new BN(account.balance).add(delta);
    await stateManager.putAccount(address, account);
}
async function default_1(opts) {
    assert(opts.data);
    // TODO(asa): Pick an appropriate gas amount
    const gasUsed = new BN(20);
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    // data is the ABI encoding for [address,address,uint256]
    // 32 bytes each, but the addresses only use 20 bytes.
    const fromAddress = new ethereumjs_util_1.Address(opts.data.slice(12, 32));
    const toAddress = new ethereumjs_util_1.Address(opts.data.slice(44, 64));
    const value = new BN(opts.data.slice(64, 96));
    await incrementBalance(opts._VM.stateManager, fromAddress, value.neg());
    await incrementBalance(opts._VM.stateManager, toAddress, value);
    return {
        gasUsed,
        returnValue: Buffer.alloc(0),
    };
}
exports.default = default_1;
//# sourceMappingURL=fd-transfer.js.map