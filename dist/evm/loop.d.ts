/// <reference types="node" />
import BN = require('bn.js');
import Common from 'ethereumjs-common';
import { StateManager } from '../state';
import PStateManager from '../state/promisified';
import { ERROR, VmError } from '../exceptions';
import Memory from './memory';
import Stack from './stack';
import EEI from './eei';
import { OpInfo } from './opcodes';
import { OpHandler } from './opFns.js';
export declare type IsException = 0 | 1;
export interface RunOpts {
    pc?: number;
}
export interface RunState {
    programCounter: number;
    opCode: number;
    memory: Memory;
    memoryWordCount: BN;
    highestMemCost: BN;
    stack: Stack;
    code: Buffer;
    validJumps: number[];
    _common: Common;
    stateManager: StateManager;
    eei: EEI;
}
export interface LoopResult {
    runState?: RunState;
    exception: IsException;
    exceptionError?: VmError | ERROR;
}
export default class Loop {
    _vm: any;
    _state: PStateManager;
    _runState: RunState;
    _eei: EEI;
    constructor(vm: any, eei: EEI);
    run(code: Buffer, opts?: RunOpts): Promise<LoopResult>;
    runStep(): Promise<void>;
    getOpHandler(opInfo: OpInfo): OpHandler;
    _runStepHook(): Promise<void>;
    _getValidJumpDests(code: Buffer): number[];
}
