/// <reference types="node" />
import BN = require('bn.js');
import Common from 'ethereumjs-common';
import { ERROR } from '../../exceptions';
import PStateManager from '../../state/promisified';
export interface PrecompileFunc {
    (opts: PrecompileInput): PrecompileResult | Promise<PrecompileResult>;
}
export interface PrecompileInput {
    data: Buffer;
    gasLimit: BN;
    _common: Common;
    stateManager: PStateManager;
}
export interface PrecompileResult {
    gasUsed: BN;
    return: Buffer;
    exception: 0 | 1;
    exceptionError?: ERROR;
}
export declare function OOGResult(gasLimit: BN): PrecompileResult;
