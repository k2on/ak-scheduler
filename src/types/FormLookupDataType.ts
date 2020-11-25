export default interface FormLookupDataType {
    PHPSESSID: string;
    login_pagerandval: string;
    login_donesubmit: 'T' | 'F';
    location: string;
    first_name: string;
    last_name: string;
    dob: string;
    dob_month: number;
    dob_day: number;
    dob_year: number;
    email: string;
    phone: string;
    submitbtn_login: string;
}
