import { StateManager } from './state';
import Common from 'ethereumjs-common';
import { RunCodeOpts, RunCodeCb } from './runCode';
import { RunCallOpts, RunCallCb } from './runCall';
import { RunTxOpts, RunTxCb } from './runTx';
import { RunBlockOpts, RunBlockCb } from './runBlock';
declare const AsyncEventEmitter: any;
/**
 * Options for instantiating a [[VM]].
 */
export interface VMOpts {
    /**
     * The chain the VM operates on
     */
    chain?: string;
    /**
     * Hardfork rules to be used
     */
    hardfork?: string;
    /**
     * A [[StateManager]] instance to use as the state store (Beta API)
     */
    stateManager?: StateManager;
    /**
     * A [merkle-patricia-tree](https://github.com/ethereumjs/merkle-patricia-tree) instance for the state tree (ignored if stateManager is passed)
     * @deprecated
     */
    state?: any;
    /**
     * A [blockchain](https://github.com/ethereumjs/ethereumjs-blockchain) object for storing/retrieving blocks
     */
    blockchain?: any;
    /**
     * If true, create entries in the state tree for the precompiled contracts
     */
    activatePrecompiles?: boolean;
    /**
     * Allows unlimited contract sizes while debugging. By setting this to `true`, the check for contract size limit of 24KB (see [EIP-170](https://git.io/vxZkK)) is bypassed
     */
    allowUnlimitedContractSize?: boolean;
    common?: Common;
}
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 */
export default class VM extends AsyncEventEmitter {
    opts: VMOpts;
    _common: Common;
    stateManager: StateManager;
    blockchain: any;
    allowUnlimitedContractSize: boolean;
    /**
     * Instantiates a new [[VM]] Object.
     * @param opts - Default values for the options are:
     *  - `chain`: 'mainnet'
     *  - `hardfork`: 'petersburg' [supported: 'byzantium', 'constantinople', 'petersburg' (will throw on unsupported)]
     *  - `activatePrecompiles`: false
     *  - `allowUnlimitedContractSize`: false [ONLY set to `true` during debugging]
     */
    constructor(opts?: VMOpts);
    /**
     * Processes blocks and adds them to the blockchain.
     * @param blockchain -  A [blockchain](https://github.com/ethereum/ethereumjs-blockchain) object to process
     * @param cb - the callback function
     */
    runBlockchain(blockchain: any, cb: any): void;
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     * @param opts - Default values for options:
     *  - `generate`: false
     *  @param cb - Callback function
     */
    runBlock(opts: RunBlockOpts, cb: RunBlockCb): void;
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     */
    runTx(opts: RunTxOpts, cb: RunTxCb): void;
    /**
     * runs a call (or create) operation.
     */
    runCall(opts: RunCallOpts, cb: RunCallCb): void;
    /**
     * Runs EVM code.
     */
    runCode(opts: RunCodeOpts, cb: RunCodeCb): void;
    /**
     * Returns a copy of the [[VM]] instance.
     */
    copy(): VM;
    _emit(topic: string, data: any): Promise<any>;
}
export {};
