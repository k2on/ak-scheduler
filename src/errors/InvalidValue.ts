import { BaseError } from '.';

/**
 * Class for representing an invalid value.
 * @class InvalidValue
 */
export default class InvalidValue extends BaseError {
    /**
     * Constructor for a value error.
     * @param {string} valueName Name of the invalid value.
     * @param {string} value     The given value.
     * @param {string} details   Details about the invalid error.
     */
    constructor(
        public valueName: string,
        public value: string,
        public details = '',
    ) {
        super(
            'ValueError',
            `'${value}' is an invalid ${valueName}${
                details != '' ? `, ${details}` : ''
            }`,
        );
    }
}
