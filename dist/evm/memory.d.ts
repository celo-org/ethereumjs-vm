/// <reference types="node" />
/**
 * Memory implements a simple memory model
 * for the ethereum virtual machine.
 */
export default class Memory {
    _store: number[];
    constructor();
    /**
     * Extends the memory given an offset and size. Rounds extended
     * memory to word-size.
     * @param {Number} offset
     * @param {Number} size
     */
    extend(offset: number, size: number): void;
    /**
     * Writes a byte array with length `size` to memory, starting from `offset`.
     * @param {Number} offset - Starting position
     * @param {Number} size - How many bytes to write
     * @param {Buffer} value - Value
     */
    write(offset: number, size: number, value: Buffer): void;
    /**
     * Reads a slice of memory from `offset` till `offset + size` as a `Buffer`.
     * It fills up the difference between memory's length and `offset + size` with zeros.
     * @param {Number} offset - Starting position
     * @param {Number} size - How many bytes to read
     * @returns {Buffer}
     */
    read(offset: number, size: number): Buffer;
}
