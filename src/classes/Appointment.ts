import { Scheduler } from '.';
import { bookAppointment } from '../logic';

/**
 * Class to represent a future appointment either booked or not booked.
 * @class Appointment
 */
export default class Appointment {
    /**
     * Constructor for an Appointment.
     * @param {Scheduler} schedular         Schedular instance.
     * @param {Date}      datetime          Time of the appointment.
     * @param {string}    appointmentTypeId Usually a location in the building.
     * @param {string}    appointmentId     Usually a staff member.
     * @param {boolean}   isBooked          If this appoitment is booked or an avaliable time.
     */
    constructor(
        private schedular: Scheduler,
        public datetime: Date,
        public appointmentTypeId: string,
        public appointmentId: string,
        public isBooked = false,
    ) {}

    /**
     * Book this appointment.
     * @function book
     * @memberof Appointment
     */
    async book(): Promise<void> {
        if (this.isBooked) throw Error('already booked');
        await bookAppointment(
            this.schedular.locationId,
            this.schedular.sessionId,
            this.datetime,
            this.appointmentId,
            this.appointmentTypeId,
        );
    }

    /**
     * Cancel this appointment.
     * @function cancel
     * @memberof Appointment
     */
    async cancel(): Promise<void> {
        if (!this.isBooked) throw Error('not booked');
    }
}
