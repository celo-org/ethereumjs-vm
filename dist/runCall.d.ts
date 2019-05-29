/// <reference types="node" />
import VM from './index';
import { InterpreterResult } from './evm/interpreter';
/**
 * Options for running a call (or create) operation
 */
export interface RunCallOpts {
    block?: any;
    gasPrice?: Buffer;
    origin?: Buffer;
    caller?: Buffer;
    gasLimit?: Buffer;
    to?: Buffer;
    value?: Buffer;
    data?: Buffer;
    /**
     * This is for CALLCODE where the code to load is different than the code from the to account
     */
    code?: Buffer;
    depth?: number;
    compiled?: boolean;
    static?: boolean;
    salt?: Buffer;
    selfdestruct?: {
        [k: string]: boolean;
    };
    delegatecall?: boolean;
}
/**
 * Callback for the [[runCall]] method.
 */
export interface RunCallCb {
    /**
     * @param error - Any error that occured during execution, or `null`
     * @param results - Results of call, or `null` if an error occured
     */
    (err: Error | null, results: InterpreterResult | null): void;
}
/**
 * @ignore
 */
export default function runCall(this: VM, opts: RunCallOpts, cb: RunCallCb): void;
