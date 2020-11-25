import { BaseError } from '.';

/**
 * Class for representing a No Results error.
 * @class NoResults
 */
export default class NoResults extends BaseError {
    /**
     * Constructor for a No Results Error.
     * @param {string} message Error message.
     */
    constructor(message: string) {
        super('No Results Error', message);
    }
}
