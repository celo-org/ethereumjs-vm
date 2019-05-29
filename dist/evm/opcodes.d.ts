export interface OpInfo {
    name: string;
    opcode: number;
    fee: number;
    dynamic: boolean;
    isAsync: boolean;
}
export declare function lookupOpInfo(op: number, full?: boolean): OpInfo;
