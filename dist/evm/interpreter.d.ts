/// <reference types="node" />
import BN = require('bn.js');
import Account from 'ethereumjs-account';
import { VmError, ERROR } from '../exceptions';
import PStateManager from '../state/promisified';
import { PrecompileFunc, PrecompileResult } from './precompiles';
import TxContext from './txContext';
import Message from './message';
import { RunState, IsException, RunOpts } from './loop';
import VM from '..';
/**
 * Result of executing a message via the [[Interpreter]].
 */
export interface InterpreterResult {
    /**
     * Amount of gas used by the transaction
     */
    gasUsed: BN;
    /**
     * Address of created account durint transaction, if any
     */
    createdAddress?: Buffer;
    /**
     * Contains the results from running the code, if any, as described in [[runCode]]
     */
    vm: ExecResult;
}
/**
 * Result of executing a call via the [[Interpreter]].
 */
export interface ExecResult {
    runState?: RunState;
    /**
     * `0` if the contract encountered an exception, `1` otherwise
     */
    exception: IsException;
    /**
     * Description of the exception, if any occured
     */
    exceptionError?: VmError | ERROR;
    /**
     * Amount of gas left
     */
    gas?: BN;
    /**
     * Amount of gas the code used to run
     */
    gasUsed: BN;
    /**
     * Return value from the contract
     */
    return: Buffer;
    /**
     * Array of logs that the contract emitted
     */
    logs?: any[];
    /**
     * Value returned by the contract
     */
    returnValue?: Buffer;
    /**
     * Amount of gas to refund from deleting storage values
     */
    gasRefund?: BN;
    /**
     * A map from the accounts that have self-destructed to the addresses to send their funds to
     */
    selfdestruct?: {
        [k: string]: Buffer;
    };
}
/**
 * @ignore
 */
export default class Interpreter {
    _vm: VM;
    _state: PStateManager;
    _tx: TxContext;
    _block: any;
    constructor(vm: VM, txContext: TxContext, block: any);
    executeMessage(message: Message): Promise<InterpreterResult>;
    _executeCall(message: Message): Promise<InterpreterResult>;
    _executeCreate(message: Message): Promise<InterpreterResult>;
    runLoop(message: Message, loopOpts?: RunOpts): Promise<ExecResult>;
    /**
     * Returns code for precompile at the given address, or undefined
     * if no such precompile exists.
     * @param {Buffer} address
     */
    getPrecompile(address: Buffer): PrecompileFunc;
    runPrecompile(code: PrecompileFunc, data: Buffer, gasLimit: BN): Promise<PrecompileResult>;
    _loadCode(message: Message): Promise<void>;
    _generateAddress(message: Message): Promise<Buffer>;
    _reduceSenderBalance(account: Account, message: Message): Promise<void>;
    _addToBalance(toAccount: Account, message: Message): Promise<void>;
    _touchAccount(address: Buffer): Promise<void>;
}
