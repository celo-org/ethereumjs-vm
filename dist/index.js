"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var state_1 = require("./state");
var ethereumjs_common_1 = require("ethereumjs-common");
var ethereumjs_account_1 = require("ethereumjs-account");
var runCode_1 = require("./runCode");
var runCall_1 = require("./runCall");
var runTx_1 = require("./runTx");
var runBlock_1 = require("./runBlock");
var runBlockchain_1 = require("./runBlockchain");
var promisify = require('util.promisify');
var AsyncEventEmitter = require('async-eventemitter');
var Blockchain = require('ethereumjs-blockchain');
var Trie = require('merkle-patricia-tree/secure.js');
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 */
var VM = /** @class */ (function (_super) {
    __extends(VM, _super);
    /**
     * Instantiates a new [[VM]] Object.
     * @param opts - Default values for the options are:
     *  - `chain`: 'mainnet'
     *  - `hardfork`: 'petersburg' [supported: 'byzantium', 'constantinople', 'petersburg' (will throw on unsupported)]
     *  - `activatePrecompiles`: false
     *  - `allowUnlimitedContractSize`: false [ONLY set to `true` during debugging]
     */
    function VM(opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this) || this;
        _this.opts = opts;
        if (opts.common) {
            if (opts.chain || opts.hardfork) {
                throw new Error('You can only instantiate the VM class with one of: opts.common, or opts.chain and opts.hardfork');
            }
            _this._common = opts.common;
        }
        else {
            var chain = opts.chain ? opts.chain : 'mainnet';
            var hardfork = opts.hardfork ? opts.hardfork : 'petersburg';
            var supportedHardforks = ['byzantium', 'constantinople', 'petersburg'];
            _this._common = new ethereumjs_common_1.default(chain, hardfork, supportedHardforks);
        }
        if (opts.stateManager) {
            _this.stateManager = opts.stateManager;
        }
        else {
            var trie = opts.state || new Trie();
            if (opts.activatePrecompiles) {
                for (var i = 1; i <= 8; i++) {
                    trie.put(new BN(i).toArrayLike(Buffer, 'be', 20), new ethereumjs_account_1.default().serialize());
                }
            }
            _this.stateManager = new state_1.StateManager({ trie: trie, common: _this._common });
        }
        _this.blockchain = opts.blockchain || new Blockchain({ common: _this._common });
        _this.allowUnlimitedContractSize =
            opts.allowUnlimitedContractSize === undefined ? false : opts.allowUnlimitedContractSize;
        return _this;
    }
    /**
     * Processes blocks and adds them to the blockchain.
     * @param blockchain -  A [blockchain](https://github.com/ethereum/ethereumjs-blockchain) object to process
     * @param cb - the callback function
     */
    VM.prototype.runBlockchain = function (blockchain, cb) {
        runBlockchain_1.default.bind(this)(blockchain, cb);
    };
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     * @param opts - Default values for options:
     *  - `generate`: false
     *  @param cb - Callback function
     */
    VM.prototype.runBlock = function (opts, cb) {
        runBlock_1.default.bind(this)(opts, cb);
    };
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     */
    VM.prototype.runTx = function (opts, cb) {
        runTx_1.default.bind(this)(opts, cb);
    };
    /**
     * runs a call (or create) operation.
     */
    VM.prototype.runCall = function (opts, cb) {
        runCall_1.default.bind(this)(opts, cb);
    };
    /**
     * Runs EVM code.
     */
    VM.prototype.runCode = function (opts, cb) {
        runCode_1.default.bind(this)(opts, cb);
    };
    /**
     * Returns a copy of the [[VM]] instance.
     */
    VM.prototype.copy = function () {
        return new VM({
            stateManager: this.stateManager.copy(),
            blockchain: this.blockchain,
            common: this._common,
        });
    };
    VM.prototype._emit = function (topic, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, promisify(this.emit.bind(this))(topic, data)];
            });
        });
    };
    return VM;
}(AsyncEventEmitter));
exports.default = VM;
//# sourceMappingURL=index.js.map