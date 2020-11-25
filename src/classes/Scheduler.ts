import { Appointment, Form } from '.';
import { getSessionValues, getUserData } from '../logic';

import { InvalidValue } from '../errors';
import { LookupDataType } from '../types';

/**
 * Class for representing a Scheduler.
 * @class Scheduler
 */
export default class Scheduler {
    private _sessionID: string | null = null;
    private loginID: string;
    public userID: string;
    private bookedAppointments: Appointment[] | null = null;
    private form: Form | null = null;

    /**
     * Constructor for a scheduler.
     * @param {string} locationID Location IDentifier.
     */
    constructor(public locationID: string) {}

    /**
     * Returns the session ID.
     *
     * Throws an error if the value is null.
     * @returns {string} Session ID.
     */
    get sessionID(): string {
        if (this._sessionID == null)
            throw Error(
                'you must create a session before accessing the session',
            );
        return this._sessionID;
    }

    /**
     * Get a trainer id from their name.
     * @param   {string} trainerName Trainer name.
     * @returns {string}             Trainer ID.
     */
    getTrainerIDFromName(trainerName: string): string {
        if (this.form == null) throw Error('Must get the form first');
        return this.form.getTrainerIDFromName(trainerName);
    }

    /**
     * Get an appointment type form its name.
     * @param   {string} appointmentType The appointment name.
     * @returns {string}                 Appointment ID.
     */
    getAppointmentTypeFromName(appointmentType: string): string {
        if (this.form == null) throw Error('Must get the form first');
        return this.form.getAppointmentTypeFromName(appointmentType);
    }

    /**
     * Get the trainer name from their ID.
     * @param   {string} trainerID ID of the trainer.
     * @returns {string}           Trainer label.
     */
    getTrainerName(trainerID: string): string {
        if (this.form == null) throw Error('Must get the form first');
        return this.form.getTrainerName(trainerID);
    }

    /**
     * Get the appointment type name from its ID.
     * @param   {string} typeID ID of the trainer.
     * @returns {string}        Appointment type label.
     */
    getAppointmentTypeName(typeID: string): string {
        if (this.form == null) throw Error('Must get the form first');
        return this.form.getAppointmentTypeName(typeID);
    }

    /**
     * Creates a new session with the Schedule King Servers.
     * @function createSession
     * @memberof Scheduler
     * @returns {Promise<void>}
     */
    async createSession(): Promise<void> {
        const { sessionID, loginID } = await getSessionValues(this.locationID);
        this._sessionID = sessionID;
        this.loginID = loginID;
    }

    /**
     * Refreshes the user data.
     * @param {LookupDataType} formData User lookup data.
     * @returns {Promise<void>}
     */
    async refreshUserData(formData: LookupDataType): Promise<void> {
        const {
            userID,
            appointments,
            filters: {
                dateOptions,
                appointmentOptions,
                trainerOptions: staffOptions,
            },
        } = await getUserData(
            this.locationID,
            this.sessionID,
            this.loginID,
            formData,
        );
        this.userID = userID;
        this.bookedAppointments = appointments.map(
            (appointment) =>
                new Appointment(
                    this,
                    appointment.datetime,
                    appointment.typeID,
                    appointment.trainerID,
                    true,
                    appointment.id,
                ),
        );

        this.form = new Form(this, [
            {
                name: 'date_filter',
                label: 'Date',
                options: dateOptions,
            },
            {
                name: 'appointment_type_filter',
                label: 'AppointmentType',
                options: appointmentOptions,
            },
            {
                name: 'trainer_filter',
                label: 'Staff',
                options: staffOptions,
            },
        ]);
    }

    /**
     * Returns the form.
     * @param   {LookupDataType | null} formData User lookup data.
     * @param   {boolean}               refresh  Refresh the current form.
     * @throws  {InvalidValue}                   Invalid form data.
     * @throws  {Error}                          If the form is null after a refresh.
     * @returns {Promise<Form>}                  A promise of a form.
     */
    async getForm(
        formData: LookupDataType | null = null,
        refresh = false,
    ): Promise<Form> {
        if (!refresh && this.form != null) return this.form;
        if (formData == null)
            throw new InvalidValue(
                'formData',
                'null',
                'Can not be null if trying to refresh',
            );
        await this.refreshUserData(formData);
        if (this.form == null)
            throw Error(
                'form should not be null after refresh, please create an issue',
            );
        return this.form;
    }

    /**
     * Returns the form.
     * @param   {LookupDataType | null} formData User lookup data.
     * @param   {boolean}               refresh  Refresh the current form.
     * @throws  {InvalidValue}                   Invalid form data.
     * @throws  {Error}                          If the form is null after a refresh.
     * @returns {Promise<Form>}                  A promise of a form.
     */
    async getBookedAppointments(
        formData: LookupDataType | null = null,
        refresh = false,
    ): Promise<Appointment[]> {
        if (!refresh && this.bookedAppointments != null)
            return this.bookedAppointments;
        if (formData == null)
            throw new InvalidValue(
                'formData',
                'null',
                'Can not be null if trying to refresh',
            );
        await this.refreshUserData(formData);
        if (this.bookedAppointments == null)
            throw Error(
                'booked appointments should not be null after refresh, please create an issue',
            );
        return this.bookedAppointments;
    }
}
