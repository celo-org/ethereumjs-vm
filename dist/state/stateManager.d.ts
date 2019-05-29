/// <reference types="node" />
import Common from 'ethereumjs-common';
import Account from 'ethereumjs-account';
import Cache from './cache';
/**
 * Storage values of an account
 */
export interface StorageDump {
    [key: string]: string;
}
/**
 * Interface for getting and setting data from an underlying
 * state trie.
 */
export default class StateManager {
    _common: Common;
    _trie: any;
    _storageTries: any;
    _cache: Cache;
    _touched: Set<string>;
    _touchedStack: Set<string>[];
    _checkpointCount: number;
    _originalStorageCache: Map<string, Map<string, Buffer>>;
    /**
     * Instantiate the StateManager interface.
     * @param {Object} [opts={}]
     * @param {Common} [opts.common] - [`Common`](https://github.com/ethereumjs/ethereumjs-common) parameters of the chain
     * @param {Trie} [opts.trie] - a [`merkle-patricia-tree`](https://github.com/ethereumjs/merkle-patricia-tree) instance
     */
    constructor(opts?: any);
    /**
     * Copies the current instance of the `DefaultStateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted
     * @memberof DefaultStateManager
     * @method copy
     */
    copy(): StateManager;
    /**
     * Callback for `getAccount` method
     * @callback getAccount~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Account} account An [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account)
     * instance corresponding to the provided `address`
     */
    /**
     * Gets the [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account)
     * associated with `address`. Returns an empty account if the account does not exist.
     * @memberof StateManager
     * @method getAccount
     * @param {Buffer} address Address of the `account` to get
     * @param {getAccount~callback} cb
     */
    getAccount(address: Buffer, cb: any): void;
    /**
     * Saves an [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account)
     * into state under the provided `address`
     * @memberof StateManager
     * @method putAccount
     * @param {Buffer} address Address under which to store `account`
     * @param {Account} account The [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account) to store
     * @param {Function} cb Callback function
     */
    putAccount(address: Buffer, account: Account, cb: any): void;
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @memberof StateManager
     * @method putContractCode
     * @param {Buffer} address - Address of the `account` to add the `code` for
     * @param {Buffer} value - The value of the `code`
     * @param {Function} cb Callback function
     */
    putContractCode(address: Buffer, value: Buffer, cb: any): void;
    /**
     * Callback for `getContractCode` method
     * @callback getContractCode~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Buffer} code The code corresponding to the provided address.
     * Returns an empty `Buffer` if the account has no associated code.
     */
    /**
     * Gets the code corresponding to the provided `address`
     * @memberof StateManager
     * @method getContractCode
     * @param {Buffer} address Address to get the `code` for
     * @param {getContractCode~callback} cb
     */
    getContractCode(address: Buffer, cb: any): void;
    /**
     * Creates a storage trie from the primary storage trie
     * for an account and saves this in the storage cache.
     * @private
     * @memberof DefaultStateManager
     * @method _lookupStorageTrie
     * @param {Buffer} address
     * @param {Function} cb Callback function
     */
    _lookupStorageTrie(address: Buffer, cb: any): void;
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup
     * @private
     * @memberof DefaultStateManager
     * @method _getStorageTrie
     * @param {Buffer} address
     * @param {Function} cb Callback function
     */
    _getStorageTrie(address: Buffer, cb: any): void;
    /**
     * Callback for `getContractStorage` method
     * @callback getContractStorage~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Buffer} storageValue The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exists an empty `Buffer` is returned
     */
    /**
     * Gets the storage value associated with the provided `address` and `key`
     * @memberof StateManager
     * @method getContractStorage
     * @param {Buffer} address Address of the account to get the storage for
     * @param {Buffer} key Key in the account's storage to get the value for
     * @param {getContractCode~callback} cb
     */
    getContractStorage(address: Buffer, key: Buffer, cb: any): void;
    /**
     * Caches the storage value associated with the provided `address` and `key`
     * on first invocation, and returns the cached (original) value from then
     * onwards. This is used to get the original value of a storage slot for
     * computing gas costs according to EIP-1283.
     * @param address - Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for
     */
    getOriginalContractStorage(address: Buffer, key: Buffer, cb: any): void;
    /**
     * Modifies the storage trie of an account
     * @private
     * @memberof DefaultStateManager
     * @method _modifyContractStorage
     * @param {Buffer} address Address of the account whose storage is to be modified
     * @param {Function} modifyTrie function to modify the storage trie of the account
     */
    _modifyContractStorage(address: Buffer, modifyTrie: any, cb: any): void;
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`
     * @memberof StateManager
     * @method putContractStorage
     * @param {Buffer} address Address to set a storage value for
     * @param {Buffer} key Key to set the value at
     * @param {Buffer} value Value to set at `key` for account corresponding to `address`
     * @param {Function} cb Callback function
     */
    putContractStorage(address: Buffer, key: Buffer, value: Buffer, cb: any): void;
    /**
     * Clears all storage entries for the account corresponding to `address`
     * @memberof StateManager
     * @method clearContractStorage
     * @param {Buffer} address Address to clear the storage of
     * @param {Function} cb Callback function
     */
    clearContractStorage(address: Buffer, cb: any): void;
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     * @memberof StateManager
     * @method checkpoint
     * @param {Function} cb Callback function
     */
    checkpoint(cb: any): void;
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     * @memberof StateManager
     * @method commit
     * @param {Function} cb Callback function
     */
    commit(cb: any): void;
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     * @memberof StateManager
     * @method revert
     * @param {Function} cb Callback function
     */
    revert(cb: any): void;
    /**
     * Callback for `getStateRoot` method
     * @callback getStateRoot~callback
     * @param {Error} error an error that may have happened or `null`.
     * Will be an error if the un-committed checkpoints on the instance.
     * @param {Buffer} stateRoot The state-root of the `StateManager`
     */
    /**
     * Gets the state-root of the Merkle-Patricia trie representation
     * of the state of this StateManager. Will error if there are uncommitted
     * checkpoints on the instance.
     * @memberof StateManager
     * @method getStateRoot
     * @param {getStateRoot~callback} cb
     */
    getStateRoot(cb: any): void;
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @memberof StateManager
     * @method setStateRoot
     * @param {Buffer} stateRoot The state-root to reset the instance to
     * @param {Function} cb Callback function
     */
    setStateRoot(stateRoot: Buffer, cb: any): void;
    /**
     * Callback for `dumpStorage` method
     * @callback dumpStorage~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Object} accountState The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    /**
     * Dumps the the storage values for an `account` specified by `address`
     * @memberof DefaultStateManager
     * @method dumpStorage
     * @param {Buffer} address The address of the `account` to return storage for
     * @param {dumpStorage~callback} cb
     */
    dumpStorage(address: Buffer, cb: any): void;
    /**
     * Callback for `hasGenesisState` method
     * @callback hasGenesisState~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Boolean} hasGenesisState Whether the storage trie contains the
     * canonical genesis state for the configured chain parameters.
     */
    /**
     * Checks whether the current instance has the canonical genesis state
     * for the configured chain parameters.
     * @memberof DefaultStateManager
     * @method hasGenesisState
     * @param {hasGenesisState~callback} cb
     */
    hasGenesisState(cb: any): void;
    /**
     * Generates a canonical genesis state on the instance based on the
     * configured chain parameters. Will error if there are uncommitted
     * checkpoints on the instance.
     * @memberof StateManager
     * @method generateCanonicalGenesis
     * @param {Function} cb Callback function
     */
    generateCanonicalGenesis(cb: any): void;
    /**
     * Initializes the provided genesis state into the state trie
     * @memberof DefaultStateManager
     * @method generateGenesis
     * @param {Object} initState
     * @param {Function} cb Callback function
     */
    generateGenesis(initState: any, cb: any): any;
    /**
     * Callback for `accountIsEmpty` method
     * @callback accountIsEmpty~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Boolean} empty True if the account is empty false otherwise
     */
    /**
     * Checks if the `account` corresponding to `address` is empty as defined in
     * EIP-161 (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-161.md)
     * @memberof StateManager
     * @method accountIsEmpty
     * @param {Buffer} address Address to check
     * @param {accountIsEmpty~callback} cb
     */
    accountIsEmpty(address: Buffer, cb: any): void;
    /**
     * Removes accounts form the state trie that have been touched,
     * as defined in EIP-161 (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-161.md).
     * @memberof StateManager
     * @method cleanupTouchedAccounts
     * @param {Function} cb Callback function
     */
    cleanupTouchedAccounts(cb: any): void;
    /**
     * Clears the original storage cache. Refer to [[getOriginalContractStorage]]
     * for more explanation.
     * @ignore
     */
    _clearOriginalStorageCache(): void;
}
