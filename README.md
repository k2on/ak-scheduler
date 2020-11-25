<p align="center"><img src="https://dta0yqvfnusiq.cloudfront.net/appointmentking/2016/06/20160614-154939-lower-logo1.png" alt="Logo" /><p>

<p align="center">
  <strong>Appointment King Scheduler</strong><br />
  <sub>Manage Appointment King schedules</sub>
</p>

<p align="center">
  [ <a href="#installation">Installation 💾</a> | <a href="#usage">Usage 🤓</a> | <a href="https://www.npmjs.com/package/ak-scheduler">NPM 📦</a> | <a href="https://github.com/k2on/ak-scheduler">Github 🕸</a> ]
</p>

# Installation

```sh
yarn add ak-scheduler
```

# Usage

```typescript
import { Scheduler } from 'ak-scheduler';

// user lookup data
const data = {
    firstName: 'John',
    lastName: 'Doe',
    birthdate: new Date('2000-01-01'),
    email: 'john@example.com',
    phone: '(800) 000-0000',
};

// Create the scheduler
const scheduler = new Scheduler('0000'); //  <-- location id

// Create a session
scheduler.createSession().then(() => {
    scheduler.getBookedAppointments(data).then((appts) => {
        console.log(appts);
    });
});
```

Will output

```typescript
[
Appointment {
  datetime: '2020-11-25T23:45:00.000Z',
  typeID: '09821',
  trainerID: '562354',
  isBooked: true,
  id: '5687446' }
]
```

# Dependencies

-   [Axios](https://github.com/axios/axios): Sending HTTP requests
-   [Cheerio](https://github.com/cheeriojs/cheerio): Parsing HTML
