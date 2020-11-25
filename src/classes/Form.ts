import { Appointment, Scheduler } from '.';

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
     * Updates the fields of the form.
     * @param {Record<string, unknown>} data Object of the field data.
     */
    updateFields(data: Record<string, unknown>): void {
        const keys = Object.keys(data);
        for (const i in keys) {
            const key = keys[i];
            const field = this.getField(key);
            if (field == null) throw Error(`'${key}' is not a valid field`);
        }
        this.data = data;
    }

    /**
     * Gets the current times from the filters.
     * @throws {NoResults}
     * @returns {Promise} Times.
     */
    async getAppointmentTimes(): Promise<Appointment[]> {
        const response = await getTimes(
            this.scheduler.locationId,
            this.scheduler.sessionId,
            this.data,
        );
        return response.times.map(
            (time) =>
                new Appointment(
                    this.scheduler,
                    new Date(`${this.data.date_filter} ${time.time_24}:00`),
                    this.data.appointment_type_filter as string,
                    this.data.trainer_filter as string,
                ),
        );
    }
}
