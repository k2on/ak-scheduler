import { bookAppointment, cancelAppointment } from '../logic';

import { Scheduler } from '.';

/**
 * Class to represent a future appointment either booked or not booked.
 * @class Appointment
 */
export default class Appointment {
    /**
     * Constructor for an Appointment.
     * @param {Scheduler} schedular         Schedular instance.
     * @param {Date}      datetime          Time of the appointment.
     * @param {string}    typeID Usually a location in the building.
     * @param {string}    trainerID     Usually a staff member.
     * @param {boolean}   isBooked          If this appoitment is booked or an avaliable time.
     * @param {string}    id                Appointment ID if booked.
     */
    constructor(
        private schedular: Scheduler,
        public datetime: Date,
        public typeID: string,
        public trainerID: string,
        public isBooked = false,
        public id: string,
    ) {}

    /**
     * Get the trainer name.
     * @returns {string} Trainer label.
     */
    get trainerName(): string {
        return this.schedular.getTrainerName(this.trainerID);
    }

    /**
     * Get the type name.
     * @returns {string} Appointment label.
     */
    get typeName(): string {
        return this.schedular.getAppointmentTypeName(this.typeID);
    }

    /**
     * Book this appointment.
     * @function book
     * @memberof Appointment
     */
    async book(): Promise<void> {
        if (this.isBooked) throw Error('already booked');
        await bookAppointment(
            this.schedular.locationID,
            this.schedular.sessionID,
            this.datetime,
            this.id,
            this.typeID,
        );
    }

    /**
     * Cancel this appointment.
     * @function cancel
     * @memberof Appointment
     */
    async cancel(): Promise<void> {
        if (!this.isBooked) throw Error('not booked');
        if (this.id == null) throw Error('Appt ID is null');
        await cancelAppointment(
            this.schedular.locationID,
            this.schedular.sessionID,
            this.schedular.userID,
            this.id,
        );
    }
}
