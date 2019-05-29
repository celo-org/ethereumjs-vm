"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promisify = require('util.promisify');
/**
 * Promisified wrapper around [[StateManager]]
 * @ignore
 */
var PStateManager = /** @class */ (function () {
    function PStateManager(wrapped) {
        this._wrapped = wrapped;
    }
    PStateManager.prototype.copy = function () {
        return new PStateManager(this._wrapped.copy());
    };
    PStateManager.prototype.getAccount = function (addr) {
        return promisify(this._wrapped.getAccount.bind(this._wrapped))(addr);
    };
    PStateManager.prototype.putAccount = function (addr, account) {
        return promisify(this._wrapped.putAccount.bind(this._wrapped))(addr, account);
    };
    PStateManager.prototype.putContractCode = function (addr, code) {
        return promisify(this._wrapped.putContractCode.bind(this._wrapped))(addr, code);
    };
    PStateManager.prototype.getContractCode = function (addr) {
        return promisify(this._wrapped.getContractCode.bind(this._wrapped))(addr);
    };
    PStateManager.prototype.getContractStorage = function (addr, key) {
        return promisify(this._wrapped.getContractStorage.bind(this._wrapped))(addr, key);
    };
    PStateManager.prototype.getOriginalContractStorage = function (addr, key) {
        return promisify(this._wrapped.getOriginalContractStorage.bind(this._wrapped))(addr, key);
    };
    PStateManager.prototype.putContractStorage = function (addr, key, value) {
        return promisify(this._wrapped.putContractStorage.bind(this._wrapped))(addr, key, value);
    };
    PStateManager.prototype.clearContractStorage = function (addr) {
        return promisify(this._wrapped.clearContractStorage.bind(this._wrapped))(addr);
    };
    PStateManager.prototype.checkpoint = function () {
        return promisify(this._wrapped.checkpoint.bind(this._wrapped))();
    };
    PStateManager.prototype.commit = function () {
        return promisify(this._wrapped.commit.bind(this._wrapped))();
    };
    PStateManager.prototype.revert = function () {
        return promisify(this._wrapped.revert.bind(this._wrapped))();
    };
    PStateManager.prototype.getStateRoot = function () {
        return promisify(this._wrapped.getStateRoot.bind(this._wrapped))();
    };
    PStateManager.prototype.setStateRoot = function (root) {
        return promisify(this._wrapped.setStateRoot.bind(this._wrapped))(root);
    };
    PStateManager.prototype.dumpStorage = function (address) {
        return promisify(this._wrapped.dumpStorage.bind(this._wrapped))(address);
    };
    PStateManager.prototype.hasGenesisState = function () {
        return promisify(this._wrapped.hasGenesisState.bind(this._wrapped))();
    };
    PStateManager.prototype.generateCanonicalGenesis = function () {
        return promisify(this._wrapped.generateCanonicalGenesis.bind(this._wrapped))();
    };
    PStateManager.prototype.generateGenesis = function (initState) {
        return promisify(this._wrapped.generateGenesis.bind(this._wrapped))(initState);
    };
    PStateManager.prototype.accountIsEmpty = function (address) {
        return promisify(this._wrapped.accountIsEmpty.bind(this._wrapped))(address);
    };
    PStateManager.prototype.cleanupTouchedAccounts = function () {
        return promisify(this._wrapped.cleanupTouchedAccounts.bind(this._wrapped))();
    };
    return PStateManager;
}());
exports.default = PStateManager;
//# sourceMappingURL=promisified.js.map