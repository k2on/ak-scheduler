import {
    FormLookupDataType,
    LookupDataType,
    OptionsType,
    TimeResponseType,
} from './types';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import { formatPhone, getValueFromLabel, parseOptions } from './util';

import { NoResults } from './errors';
import { SCHEDULER_URL } from './constants';
import axios from 'axios';
import { load } from 'cheerio';

/**
 * Gets the initial session values.
 * @param   {string}                                          locationID Location ID.
 * @returns {Promise<{ sessionID: string; loginID: string }>}            Promise of session ID and login ID.
 */
export const getSessionValues = async (
    locationID: string,
): Promise<{ sessionID: string; loginID: string }> => {
    const url = `${SCHEDULER_URL}?domid=${locationID}`;
    const response = await axios.get(url);
    const $ = load(response.data);
    const sessionID = $('#sessid').val();
    const loginID = $('#login_pagerandval').val();
    return { sessionID, loginID };
};

type AppointmentsType = {
    id: string;
    typeID: string;
    trainerID: string;
    datetime: Date;
}[];

type UserDataResponse = Promise<{
    userID: string;
    appointments: AppointmentsType;
    filters: {
        dateOptions: OptionsType;
        appointmentOptions: OptionsType;
        trainerOptions: OptionsType;
    };
}>;

/**
 * Returns data for a user from their information.
 * @async
 * @param   {string}         locationID Location ID for AK.
 * @param   {string}         sessionID  Session ID generated by the site.
 * @param   {string}         loginID    Random number generated by the site for login.
 * @param   {LookupDataType} userData   Data to lookup a user.
 * @returns {UserDataResponse}          Object of the user data response.
 */
export const getUserData = async (
    locationID: string,
    sessionID: string,
    loginID: string,
    userData: LookupDataType,
): UserDataResponse => {
    const url = `${SCHEDULER_URL}?domid=${locationID}`;
    const dob_month = userData.birthdate.getUTCMonth() + 1,
        dob_day = userData.birthdate.getUTCDate(),
        dob_year = userData.birthdate.getUTCFullYear(),
        formLookupData: FormLookupDataType = {
            PHPSESSID: sessionID,
            login_pagerandval: loginID,
            login_donesubmit: 'T',
            location: locationID,
            first_name: userData.firstName,
            last_name: userData.lastName,
            dob: `${dob_year}-${dob_month}-${dob_day}`,
            dob_month,
            dob_day,
            dob_year,
            email: userData.email,
            phone: formatPhone(userData.phone),
            submitbtn_login: 'Find Me!',
        };

    const response = await axios.post(
        url,
        stringify((formLookupData as unknown) as ParsedUrlQueryInput),
    );
    const $ = load(response.data);

    const userID = $('#uid').val();
    const dateOptions = parseOptions($, 'date');
    const appointmentOptions = parseOptions($, 'appointment-type');
    const trainerOptions = parseOptions($, 'trainer');

    const bookedAppointments = $(`.bookedContainer > div`);
    const appointments: AppointmentsType = [];

    bookedAppointments.each((_, appointment) => {
        const appointmentID = appointment.attribs['class'].split(
            'bookedAppt-',
        )[1];

        /**
         * Get the text value from an element.
         * @param   {string} name Container class.
         * @returns {string}      Text value inside the class.
         */
        const getElementValue = (name: string): string =>
            $(`.bookedAppt-${appointmentID} .booked-${name}`).text().trim();

        const appointmentDate = getElementValue('appt-date'),
            appointmentTimeRange = getElementValue('appt-time'),
            appointmentTypeName = getElementValue('appt-name'),
            appointmentTrainerName = getElementValue('user-name'),
            appointmentTimes = appointmentTimeRange.split(' - '),
            startTime = appointmentTimes[0],
            typeID =
                getValueFromLabel(appointmentOptions, appointmentTypeName) ||
                'Unknown Type',
            trainerID =
                getValueFromLabel(trainerOptions, appointmentTrainerName) ||
                'Unknown Trainer';

        appointments.push({
            id: appointmentID,
            typeID,
            trainerID,
            datetime: new Date(`${appointmentDate} ${startTime}`),
        });
    });

    return {
        userID,
        appointments,
        filters: {
            dateOptions,
            appointmentOptions,
            trainerOptions,
        },
    };
};

/**
 * Returns the time for specified filters.
 * @async
 * @param   {string}                    locationID Location ID.
 * @param   {string}                    sessionID  Session ID.
 * @param   {Record<string, unknown>}   filters    Object of filters for the query.
 * @returns {Promise<TimeResponseType>}            Time response.
 */
export const getTimes = async (
    locationID: string,
    sessionID: string,
    filters: Record<string, unknown>,
): Promise<TimeResponseType> => {
    const response = await axios.get(SCHEDULER_URL, {
        params: {
            ...filters,
            ...{
                domid: locationID,
                request: 'get_list',
                sessid: sessionID,
                appt_sel: '',
                external_cal: 'false',
            },
        },
    });
    if (response.data.length == 0)
        throw new NoResults('No results for the filter from the API');
    if (response.data.length > 1)
        console.warn('There were too many results from the API');
    return response.data[0] as TimeResponseType;
};

export const bookAppointment = async (
    locationID: string,
    sessionID: string,
    datetime: Date,
    appointmentID: string, // Staff
    appointmentTypeID: string, // Location
    availabilityID = '',
): Promise<void> => {
    const data = stringify({
        request: 'make_request',
        domid: locationID,
        sessid: sessionID,
        datetime: `${datetime.getUTCFullYear()}-${
            datetime.getUTCMonth() + 1
        }-${datetime.getUTCDate()} ${datetime.getHours()}:${datetime.getUTCMinutes()}:00`,
        availability_id: availabilityID,
        appointment_id: appointmentID,
        appointment_type_id: appointmentTypeID,
    } as ParsedUrlQueryInput);
    const response = await axios.post(SCHEDULER_URL, data);
    if (response.data.success == 0)
        throw Error(`could not create appointment: ${response.data.error}`);
};

export const cancelAppointment = async (
    locationID: string,
    sessionID: string,
    userID: string,
    appointmentID: string,
): Promise<void> => {
    const response = await axios.post(
        SCHEDULER_URL,
        stringify({
            request: 'cancel_appt',
            domid: locationID,
            sessid: sessionID,
            uid: userID,
            apptid: appointmentID,
        } as ParsedUrlQueryInput),
    );
    console.log(response.data);
};
