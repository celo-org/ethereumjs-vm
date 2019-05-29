import BN = require('bn.js');
import VM from './index';
import Bloom from './bloom';
import { InterpreterResult } from './evm/interpreter';
/**
 * Options for the `runTx` method.
 */
export interface RunTxOpts {
    /**
     * The block to which the `tx` belongs
     */
    block?: any;
    /**
     * A [`Transaction`](https://github.com/ethereum/ethereumjs-tx) to run
     */
    tx: any;
    /**
     * If true, skips the nonce check
     */
    skipNonce?: boolean;
    /**
     * If true, skips the balance check
     */
    skipBalance?: boolean;
}
/**
 * Callback for `runTx` method
 */
export interface RunTxCb {
    /**
     * @param error - An error that may have happened or `null`
     * @param results - Results of the execution
     */
    (err: Error | null, results: RunTxResult | null): void;
}
/**
 * Execution result of a transaction
 */
export interface RunTxResult extends InterpreterResult {
    /**
     * Bloom filter resulted from transaction
     */
    bloom: Bloom;
    /**
     * The amount of ether used by this transaction
     */
    amountSpent: BN;
    /**
     * The amount of gas as that was refunded during the transaction (i.e. `gasUsed = totalGasConsumed - gasRefund`)
     */
    gasRefund?: BN;
}
/**
 * @ignore
 */
export default function runTx(this: VM, opts: RunTxOpts, cb: RunTxCb): void;
