import { InvalidValue } from './errors';
import { OptionsType } from './types';

/**
 * Parses an options element and returns a list of values and labels.
 * @param   {cheerio.Root} $  Cheerio parser.
 * @param   {string}       id ID of the select element to get.
 * @returns {OptionsType}     List of values and labels.
 */
export const parseOptions = ($: cheerio.Root, id: string): OptionsType => {
    const optionElements = $(`#${id}-filter`).children('option');
    const options: OptionsType = [];
    for (let i = 0; i < optionElements.length; i++) {
        const option = optionElements[i],
            value = option.attribs['value'],
            label = option.children[0].data as string;
        if (value == '-1') continue;
        options.push({ value: value, label: label.trim() });
    }
    return options;
};

/**
 * Convert a phone string into the format of (800) 000-000.
 * @param   {string} phone Initial value.
 * @returns {string}       Converted format.
 */
export const formatPhone = (phone: string): string => {
    if (phone.length == 14) return phone;
    if (phone.length != 10)
        throw new InvalidValue(
            'phone',
            phone,
            'Must properly formatted or 10 characters',
        );
    return `(${phone.substr(0, 3)}) ${phone.substr(4, 3)}-${phone.substr(
        7,
        3,
    )}`;
};

/**
 * Returns a value from a label from an options type.
 * @param   {OptionsType} options Array of options.
 * @param   {string}      label   Label to find.
 * @param   {boolean}     exact   Exact match, (default: `false`).
 * @throws  {Error}               No match.
 * @returns {string}              Matched value.
 */
export const getValueFromLabel = (
    options: OptionsType,
    label: string,
    exact = false,
): string | null => {
    const match = options
        .filter((option) =>
            exact
                ? option.label == label
                : option.label.toLowerCase().includes(label.toLowerCase()),
        )
        .map((option) => option.value);
    if (match.length != 1) return null;
    return match[0];
};

/**
 * Returns a label from a value from an options type.
 * @param   {OptionsType} options Array of options.
 * @param   {string}      value   Value to find.
 * @throws  {Error}               No match.
 * @returns {string}              Matched label.
 */
export const getLabelFromValue = (
    options: OptionsType,
    value: string,
): string | null => {
    const match = options
        .filter((option) => option.value == value)
        .map((option) => option.label);
    if (match.length != 1) return null;
    return match[0];
};
