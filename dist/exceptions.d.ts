export declare enum ERROR {
    OUT_OF_GAS = "out of gas",
    STACK_UNDERFLOW = "stack underflow",
    STACK_OVERFLOW = "stack overflow",
    INVALID_JUMP = "invalid JUMP",
    INVALID_OPCODE = "invalid opcode",
    OUT_OF_RANGE = "value out of range",
    REVERT = "revert",
    STATIC_STATE_CHANGE = "static state change",
    INTERNAL_ERROR = "internal error",
    CREATE_COLLISION = "create collision",
    STOP = "stop"
}
export declare class VmError {
    error: ERROR;
    errorType: string;
    constructor(error: ERROR);
}
