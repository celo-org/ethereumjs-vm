"use strict";
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
var types_1 = require("./types");
var assert = require('assert');
function default_1(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var gasUsed, fromAddress, toAddress, value, fromAcc, toAcc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    assert(opts.data);
                    gasUsed = new BN(20);
                    if (opts.gasLimit.lt(gasUsed)) {
                        return [2 /*return*/, types_1.OOGResult(opts.gasLimit)];
                    }
                    fromAddress = opts.data.slice(0, 32);
                    toAddress = opts.data.slice(32, 64);
                    value = new BN(opts.data.slice(64, 96));
                    return [4 /*yield*/, opts.stateManager.getAccount(fromAddress)];
                case 1:
                    fromAcc = _a.sent();
                    fromAcc.balance = new BN(fromAcc.balance).sub(value).toBuffer();
                    return [4 /*yield*/, opts.stateManager.putAccount(fromAddress, fromAcc)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, opts.stateManager.getAccount(toAddress)];
                case 3:
                    toAcc = _a.sent();
                    toAcc.balance = new BN(toAcc.balance).add(value).toBuffer();
                    return [4 /*yield*/, opts.stateManager.putAccount(toAddress, toAcc)];
                case 4:
                    _a.sent();
                    return [2 /*return*/, {
                            gasUsed: gasUsed,
                            return: Buffer.alloc(0),
                            exception: 1,
                        }];
            }
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=fd-transfer.js.map