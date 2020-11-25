/**
 * Base class for an Error.
 * @class BaseError
 * @abstract
 */
export default abstract class BaseError extends Error {
    /**
     * Constructor for a Base Error.
     * @param {string} name    Name of the Error.
     * @param {string} message Error message.
     */
    constructor(name: string, message: string) {
        super(`${name}: ${message}`);
    }
}
