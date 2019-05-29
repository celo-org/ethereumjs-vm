/// <reference types="node" />
import BN = require('bn.js');
import Account from 'ethereumjs-account';
import Common from 'ethereumjs-common';
import PStateManager from '../state/promisified';
import Message from './message';
import Interpreter from './interpreter';
export interface Env {
    blockchain: any;
    address: Buffer;
    caller: Buffer;
    callData: Buffer;
    callValue: BN;
    code: Buffer;
    isStatic: boolean;
    depth: number;
    gasPrice: Buffer;
    origin: Buffer;
    block: any;
    contract: Account;
}
export interface RunResult {
    logs: any;
    returnValue?: Buffer;
    gasRefund: BN;
    /**
     * A map from the accounts that have self-destructed to the addresses to send their funds to
     */
    selfdestruct: {
        [k: string]: Buffer;
    };
}
export default class EEI {
    _env: Env;
    _result: RunResult;
    _state: PStateManager;
    _interpreter: Interpreter;
    _lastReturned: Buffer;
    _common: Common;
    _gasLeft: BN;
    constructor(env: Env, state: PStateManager, interpreter: Interpreter, common: Common, gasLeft: BN);
    /**
     * Subtracts an amount from the gas counter.
     * @param {BN} amount - Amount of gas to consume
     * @throws if out of gas
     */
    useGas(amount: BN): void;
    refundGas(amount: BN): void;
    /**
     * Returns address of currently executing account.
     * @returns {Buffer}
     */
    getAddress(): Buffer;
    /**
     * Returns balance of the given account.
     * @param address - Address of account
     */
    getExternalBalance(address: Buffer): Promise<BN>;
    /**
     * Returns caller address. This is the address of the account
     * that is directly responsible for this execution.
     * @returns {BN}
     */
    getCaller(): BN;
    /**
     * Returns the deposited value by the instruction/transaction
     * responsible for this execution.
     * @returns {BN}
     */
    getCallValue(): BN;
    /**
     * Returns input data in current environment. This pertains to the input
     * data passed with the message call instruction or transaction.
     * @returns {Buffer}
     */
    getCallData(): Buffer;
    /**
     * Returns size of input data in current environment. This pertains to the
     * input data passed with the message call instruction or transaction.
     * @returns {BN}
     */
    getCallDataSize(): BN;
    /**
     * Returns the size of code running in current environment.
     * @returns {BN}
     */
    getCodeSize(): BN;
    /**
     * Returns the code running in current environment.
     * @returns {Buffer}
     */
    getCode(): Buffer;
    isStatic(): boolean;
    /**
     * Get size of an account’s code.
     * @param {BN} address - Address of account
     */
    getExternalCodeSize(address: BN): Promise<BN>;
    /**
     * Returns  code of an account.
     * @param {BN} address - Address of account
     */
    getExternalCode(address: BN | Buffer): Promise<Buffer>;
    /**
     * Returns size of current return data buffer. This contains the return data
     * from the last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     * @returns {BN}
     */
    getReturnDataSize(): BN;
    /**
     * Returns the current return data buffer. This contains the return data
     * from last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     * @returns {Buffer}
     */
    getReturnData(): Buffer;
    /**
     * Returns price of gas in current environment.
     * @returns {BN}
     */
    getTxGasPrice(): BN;
    /**
     * Returns the execution's origination address. This is the
     * sender of original transaction; it is never an account with
     * non-empty associated code.
     * @returns {BN}
     */
    getTxOrigin(): BN;
    /**
     * Returns the block’s number.
     * @returns {BN}
     */
    getBlockNumber(): BN;
    /**
     * Returns the block's beneficiary address.
     * @returns {BN}
     */
    getBlockCoinbase(): BN;
    /**
     * Returns the block's timestamp.
     * @returns {BN}
     */
    getBlockTimestamp(): BN;
    /**
     * Returns the block's difficulty.
     * @returns {BN}
     */
    getBlockDifficulty(): BN;
    /**
     * Returns the block's gas limit.
     * @returns {BN}
     */
    getBlockGasLimit(): BN;
    /**
     * Returns Gets the hash of one of the 256 most recent complete blocks.
     * @param {BN} - Number of block
     */
    getBlockHash(num: BN): Promise<BN>;
    /**
     * Store 256-bit a value in memory to persistent storage.
     * @param {Buffer} key
     * @param {Buffer} value
     */
    storageStore(key: Buffer, value: Buffer): Promise<void>;
    /**
     * Loads a 256-bit value to memory from persistent storage.
     * @param {Buffer} key - Storage key
     * @returns {Buffer}
     */
    storageLoad(key: Buffer): Promise<Buffer>;
    /**
     * Returns the current gasCounter.
     * @returns {BN}
     */
    getGasLeft(): BN;
    /**
     * Set the returning output data for the execution.
     * @param {Buffer} returnData - Output data to return
     */
    finish(returnData: Buffer): void;
    /**
     * Set the returning output data for the execution. This will halt the
     * execution immediately and set the execution result to "reverted".
     * @param {Buffer} returnData - Output data to return
     */
    revert(returnData: Buffer): void;
    /**
     * Mark account for later deletion and give the remaining balance to the
     * specified beneficiary address. This will cause a trap and the
     * execution will be aborted immediately.
     * @param {Buffer} toAddress - Beneficiary address
     */
    selfDestruct(toAddress: Buffer): Promise<void>;
    _selfDestruct(toAddress: Buffer): Promise<void>;
    /**
     * Creates a new log in the current environment.
     * @param {Buffer} data
     * @param {Number} numberOfTopics
     * @param {Buffer[]} topics
     */
    log(data: Buffer, numberOfTopics: number, topics: Buffer[]): void;
    /**
     * Sends a message with arbitrary data to a given address path.
     * @param {BN} gasLimit
     * @param {Buffer} address
     * @param {BN} value
     * @param {Buffer} data
     */
    call(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    /**
     * Message-call into this account with an alternative account's code.
     * @param {BN} gasLimit
     * @param {Buffer} address
     * @param {BN} value
     * @param {Buffer} data
     */
    callCode(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    /**
     * Sends a message with arbitrary data to a given address path, but disallow
     * state modifications. This includes log, create, selfdestruct and call with
     * a non-zero value.
     * @param {BN} gasLimit
     * @param {Buffer} address
     * @param {BN} value
     * @param {Buffer} data
     */
    callStatic(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    /**
     * Message-call into this account with an alternative account’s code, but
     * persisting the current values for sender and value.
     * @param {BN} gasLimit
     * @param {Buffer} address
     * @param {BN} value
     * @param {Buffer} data
     */
    callDelegate(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    _baseCall(msg: Message): Promise<BN>;
    /**
     * Creates a new contract with a given value.
     * @param {BN} gasLimit
     * @param {BN} value
     * @param {Buffer} data
     */
    create(gasLimit: BN, value: BN, data: Buffer, salt?: Buffer | null): Promise<BN>;
    /**
     * Creates a new contract with a given value. Generates
     * a deterministic address via CREATE2 rules.
     * @param {BN} gasLimit
     * @param {BN} value
     * @param {Buffer} data
     * @param {Buffer} salt
     */
    create2(gasLimit: BN, value: BN, data: Buffer, salt: Buffer): Promise<BN>;
    /**
     * Returns true if account is empty (according to EIP-161).
     * @param address - Address of account
     */
    isAccountEmpty(address: Buffer): Promise<boolean>;
}
