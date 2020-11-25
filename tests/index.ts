import { Scheduler } from '../src';
import { config } from 'dotenv';

config();

const main = async () => {
    const scheduler = new Scheduler(process.env.TEST_LOCATION_ID as string);
    await scheduler.createSession();

    await scheduler.getForm({
        firstName: process.env.TEST_FIRST_NAME as string,
        lastName: process.env.TEST_LAST_NAME as string,
        birthdate: new Date(process.env.TEST_BIRTHDATE as string),
        email: process.env.TEST_EMAIL as string,
        phone: process.env.TEST_PHONE as string,
    });
};

main().catch((err) => {
    console.log(err);
});
