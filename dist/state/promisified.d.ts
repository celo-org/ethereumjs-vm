/// <reference types="node" />
import Account from 'ethereumjs-account';
import { default as StateManager, StorageDump } from './stateManager';
/**
 * Promisified wrapper around [[StateManager]]
 * @ignore
 */
export default class PStateManager {
    _wrapped: StateManager;
    constructor(wrapped: StateManager);
    copy(): PStateManager;
    getAccount(addr: Buffer): Promise<Account>;
    putAccount(addr: Buffer, account: Account): Promise<void>;
    putContractCode(addr: Buffer, code: Buffer): Promise<void>;
    getContractCode(addr: Buffer): Promise<Buffer>;
    getContractStorage(addr: Buffer, key: Buffer): Promise<any>;
    getOriginalContractStorage(addr: Buffer, key: Buffer): Promise<any>;
    putContractStorage(addr: Buffer, key: Buffer, value: Buffer): Promise<void>;
    clearContractStorage(addr: Buffer): Promise<void>;
    checkpoint(): Promise<void>;
    commit(): Promise<void>;
    revert(): Promise<void>;
    getStateRoot(): Promise<Buffer>;
    setStateRoot(root: Buffer): Promise<void>;
    dumpStorage(address: Buffer): Promise<StorageDump>;
    hasGenesisState(): Promise<boolean>;
    generateCanonicalGenesis(): Promise<void>;
    generateGenesis(initState: any): Promise<void>;
    accountIsEmpty(address: Buffer): Promise<boolean>;
    cleanupTouchedAccounts(): Promise<void>;
}
