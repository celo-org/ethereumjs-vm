/// <reference types="node" />
export default class Bloom {
    bitvector: Buffer;
    /**
     * Represents a Bloom
     * @constructor
     * @param {Buffer} bitvector
     */
    constructor(bitvector?: Buffer);
    /**
     * adds an element to a bit vector of a 64 byte bloom filter
     * @method add
     * @param {Buffer} e the element to add
     */
    add(e: Buffer): void;
    /**
     * checks if an element is in the bloom
     * @method check
     * @param {Buffer} e the element to check
     * @returns {boolean} Returns {@code true} if the element is in the bloom
     */
    check(e: Buffer): boolean;
    /**
     * checks if multiple topics are in a bloom
     * @method multiCheck
     * @param {Buffer[]} topics
     * @returns {boolean} Returns {@code true} if every topic is in the bloom
     */
    multiCheck(topics: Buffer[]): boolean;
    /**
     * bitwise or blooms together
     * @method or
     * @param {Bloom} bloom
     */
    or(bloom: Bloom): void;
}
