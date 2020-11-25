import { Appointment, Form } from '.';
import { getSessionValues, getUserData } from '../logic';

import { LookupDataType } from '../types';

/**
 * Class for representing a Scheduler.
 * @class Scheduler
 */
export default class Scheduler {
    private _sessionId: string | null = null;
    private loginId: string;
    public userId: string | null = null;
    public bookedAppointments: Appointment[] = [];

    /**
     * Constructor for a scheduler.
     * @param {string} locationId Location Identifier.
     */
    constructor(public locationId: string) {}

    /**
     * Returns the session Id.
     *
     * Throws an error if the value is null.
     * @returns {string} Session Id.
     */
    get sessionId(): string {
        if (this._sessionId == null)
            throw Error(
                'you must create a session before accessing the session',
            );
        return this._sessionId;
    }

    /**
     * Creates a new session with the Schedule King Servers.
     * @function createSession
     * @memberof Scheduler
     * @returns {Promise<void>}
     */
    async createSession(): Promise<void> {
        const { sessionId, loginId } = await getSessionValues(this.locationId);
        this._sessionId = sessionId;
        this.loginId = loginId;
    }

    /**
     * Gets the options from the session.
     * @param {LookupDataType} formData Form data.
     * @returns {Promise} Options.
     */
    async getForm(formData: LookupDataType): Promise<Form> {
        const {
            userId,
            appointments,
            filters: { dateOptions, appointmentOptions, staffOptions },
        } = await getUserData(
            this.locationId,
            this.sessionId,
            this.loginId,
            formData,
        );
        this.userId = userId;
        this.bookedAppointments = appointments.map(
            (appointment) =>
                new Appointment(this, appointment.datetime, '', '', true),
        );
        return new Form(this, [
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
}
