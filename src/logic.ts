import {
    FormLookupDataType,
    LookupDataType,
    OptionsType,
    TimeResponseType,
} from './types';
import { InvalidValue, NoResults } from './errors';
import { ParsedUrlQueryInput, stringify } from 'querystring';

import { SCHEDULER_URL } from './constants';
import axios from 'axios';
import { load } from 'cheerio';

export const getSessionValues = async (
    locationId: string,
): Promise<{ sessionId: string; loginId: string }> => {
    const url = `${SCHEDULER_URL}?domid=${locationId}`;
    const response = await axios.get(url);
    const $ = load(response.data);
    const sessionId = $('#sessid').val();
    const loginId = $('#login_pagerandval').val();
    return { sessionId, loginId };
};

const parseOptions = ($: cheerio.Root, id: string) => {
    const optionElements = $(`#${id}-filter`).children('option');
    const options: OptionsType = [];
    for (let i = 0; i < optionElements.length; i++) {
        const option = optionElements[i],
            value = option.attribs['value'],
            label = option.children[0].data as string;
        if (value == '-1') continue;
        options.push({ value: value, label: label });
    }
    return options;
};

const formatPhone = (phone: string): string => {
    // Get a phone in the format of: (800) 000-000
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

type AppointmentsType = { id: string; datetime: Date }[];

export const getUserData = async (
    locationId: string,
    sessionId: string,
    loginId: string,
    userData: LookupDataType,
): Promise<{
    userId: string;
    appointments: AppointmentsType;
    filters: {
        dateOptions: OptionsType;
        appointmentOptions: OptionsType;
        staffOptions: OptionsType;
    };
}> => {
    const url = `${SCHEDULER_URL}?domid=${locationId}`;
    const dob_month = userData.birthdate.getUTCMonth() + 1,
        dob_day = userData.birthdate.getUTCDate(),
        dob_year = userData.birthdate.getUTCFullYear(),
        formLookupData: FormLookupDataType = {
            PHPSESSID: sessionId,
            login_pagerandval: loginId,
            login_donesubmit: 'T',
            location: locationId,
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

    const bookedAppointments = $(`.bookedContainer`).children('div');
    const appointments: AppointmentsType = [];
    for (let i = 0; i < bookedAppointments.length; i++) {
        const appointment = bookedAppointments[i];
        const appointmentId = appointment.attribs['class'].split(
            'bookedAppt-',
        )[1];
        appointments.push({
            id: appointmentId,
            datetime: new Date(),
        });
        // console.log(appointment);
    }

    const userId = $('#uid').val();
    const dateOptions = parseOptions($, 'date');
    const appointmentOptions = parseOptions($, 'appointment-type');
    const staffOptions = parseOptions($, 'trainer');
    return {
        userId,
        appointments,
        filters: { dateOptions, appointmentOptions, staffOptions },
    };
};

export const getTimes = async (
    locationId: string,
    sessionId: string,
    filters: Record<string, unknown>,
): Promise<TimeResponseType> => {
    const response = await axios.get(SCHEDULER_URL, {
        params: {
            ...filters,
            ...{
                domid: locationId,
                request: 'get_list',
                sessid: sessionId,
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
    locationId: string,
    sessionId: string,
    datetime: Date,
    appointmentId: string, // Staff
    appointmentTypeId: string, // Location
    availabilityId = '',
): Promise<void> => {
    const response = await axios.post(
        SCHEDULER_URL,
        stringify({
            request: 'make_request',
            domid: locationId,
            sessid: sessionId,
            datetime: `${datetime.getUTCFullYear()}-${datetime.getUTCMonth()}-${datetime.getUTCDate()} ${datetime.getUTCHours()}:${datetime.getUTCMinutes()}:00`,
            availability_id: availabilityId,
            appointment_id: appointmentId,
            appointment_type_id: appointmentTypeId,
        } as ParsedUrlQueryInput),
    );
    if (response.data.success == 0) return;
    console.log(response);

    throw response.data.error;
};

export const cancelAppointment = async (
    locationId: string,
    sessionId: string,
    userId: string,
    appointmentId: string,
): Promise<void> => {
    const response = await axios.post(
        SCHEDULER_URL,
        stringify({
            request: 'cancel_appt',
            domid: locationId,
            sessid: sessionId,
            uid: userId,
            apptid: appointmentId,
        } as ParsedUrlQueryInput),
    );
    console.log(response.data);
};
