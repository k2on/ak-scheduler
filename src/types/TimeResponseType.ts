export default interface TimeResponseType {
    appointment_type_id: string;
    duration: string;
    description: string;
    appointment_name: string;
    trainer_name: string;
    date: string;
    datetime: string;
    date_formatted: string;
    times: {
        time_24: string;
        details: string;
        time_12: string;
    }[];
    availability_id: string | null;
    appointment_id: string;
    hasCredit: string;
    firstItem: boolean;
    trainer_id: string;
    displayID: number;
}
