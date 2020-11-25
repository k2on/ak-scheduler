import { Appointment, Scheduler } from '.';
import { getLabelFromValue, getValueFromLabel } from '../util';

import { OptionsType } from '../types';
import { getTimes } from '../logic';

type FormFieldType = {
    name: string;
    label: string;
    options: OptionsType;
};

/**
 * Class to represent a Form.
 * @class Form
 */
export default class Form {
    private data: Record<string, unknown> = {};
    /**
     * Constructor for the Form.
     * @param {Scheduler}       scheduler Scheduler.
     * @param {FormFieldType[]} fields    Form fields.
     */
    constructor(private scheduler: Scheduler, public fields: FormFieldType[]) {}

    /**
     * Returns a field from its name.
     * @function getField
     * @memberof Form
     * @private
     * @param {string} name Field name.
     * @returns {FormFieldType | null} FormField or null if not found.
     */
    private getField(name: string): FormFieldType | null {
        for (const field of this.fields) {
            if (field.name == name) return field;
        }
        return null;
    }

    /**
     * Validates all the fields from keys.
     * @private
     * @param {string[]} keys Keys to test.
     */
    private validateFields(keys: string[]): void {
        for (const i in keys) {
            const key = keys[i];
            const field = this.getField(key);
            if (field == null) throw Error(`'${key}' is not a valid field`);
        }
    }

    /**
     * Get a trainer id from their name.
     * @param   {string} trainerName Trainer name.
     * @returns {string}             Trainer ID.
     */
    getTrainerIDFromName(trainerName: string): string {
        const options = this.getField('trainer_filter')?.options;
        if (options == undefined) throw Error('could not get trainer filter');
        return (
            getValueFromLabel(options, trainerName) || 'Unknown trainer name'
        );
    }

    /**
     * Get an appointment type form its name.
     * @param   {string} appointmentType The appointment name.
     * @returns {string}                 Appointment ID.
     */
    getAppointmentTypeFromName(appointmentType: string): string {
        const options = this.getField('appointment_type_filter')?.options;
        if (options == undefined) throw Error('could not get appt type filter');
        return (
            getValueFromLabel(options, appointmentType) ||
            'Unknown appointment type'
        );
    }

    /**
     * Get the trainer name from their ID.
     * @param   {string} trainerID ID of the trainer.
     * @returns {string}           Trainer label.
     */
    getTrainerName(trainerID: string): string {
        const options = this.getField('trainer_filter')?.options;
        if (options == undefined) throw Error('could not get trainer filter');
        return getLabelFromValue(options, trainerID) || 'Unknown trainer';
    }

    /**
     * Get the appointment type name from its ID.
     * @param   {string} typeID ID of the trainer.
     * @returns {string}        Appointment type label.
     */
    getAppointmentTypeName(typeID: string): string {
        const options = this.getField('appointment_type_filter')?.options;
        if (options == undefined) throw Error('could not get trainer filter');
        return getLabelFromValue(options, typeID) || 'Unknown trainer';
    }

    /**
     * Updates the fields of the form.
     * @function updateFields
     * @memberof Form
     * @param {Record<string, unknown>} givenData Object of the field data.
     */
    updateFields(givenData: Record<string, unknown>): void {
        const keys = Object.keys(givenData),
            values = Object.values(givenData),
            data: Record<string, string> = {};
        this.validateFields(Object.keys(data));

        for (const i in keys) {
            const key = keys[i],
                givenValue = values[i] as string,
                field = this.getField(key),
                match = getValueFromLabel(field?.options || [], givenValue),
                value = match || givenValue;

            data[key] = value;
        }

        console.log(data);

        this.data = data;
    }

    /**
     * Updates the fields base on text.
     *
     * This works by matching the first filter value with the provided text.
     * This just does an include for a case insensative value.
     * @function updateFieldsFromText
     * @memberof Form
     * @param {Record<string, string>} data Object of the field data.
     */

    /**
     * Gets the current times from the filters.
     * @throws {NoResults}
     * @returns {Promise} Times.
     */
    async getAppointmentTimes(): Promise<Appointment[]> {
        const response = await getTimes(
            this.scheduler.locationID,
            this.scheduler.sessionID,
            this.data,
        );
        return response.times.map(
            (time) =>
                new Appointment(
                    this.scheduler,
                    new Date(`${this.data.date_filter} ${time.time_24}:00`),
                    this.data.appointment_type_filter as string,
                    this.data.trainer_filter as string,
                    false,
                    time.details.split('|')[0],
                ),
        );
    }
}
