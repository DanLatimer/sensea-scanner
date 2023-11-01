import { Emailer } from './emailer/emailer.js';
import { Fetcher } from './fetcher/fetcher.js';
import { Persistence } from './persistence/persistence.js';
import { DBDatesAvailabilities, DateYYYYMMDD } from './types.js';

const datesInterested: DateYYYYMMDD[] = [
  '2023-11-04',
  '2023-11-05',
  '2023-11-11',
  '2023-11-12',
  '2023-10-31',
];

const run = async () => {
  const db = new Persistence('./db.json');
  const fetcher = new Fetcher();
  const emailer = new Emailer();
  console.log('Starting Sensea Scanner');

  console.log('------------------------------------------------\n');

  console.log('Interested in these dates: ', datesInterested);

  const dates = await fetcher.queryMonthsForDates(datesInterested);

  const datesInterestedEmptyResults: DBDatesAvailabilities = Object.fromEntries(
    datesInterested.map((date) => [date, {}]),
  );

  const datesAvailabilities = {
    ...datesInterestedEmptyResults,
    ...(await fetcher.queryDates(dates)),
  };

  const newAvailabilities =
    db.identifyNewAvailabilitiesForDates(datesAvailabilities);

  console.log('newAvailabilities', newAvailabilities);
  db.addAvailabilities(datesAvailabilities);

  if (
    Object.keys(newAvailabilities.newBookings).length > 0 ||
    Object.keys(newAvailabilities.newCancellations).length > 0
  ) {
    emailer.sendMail(datesInterested, newAvailabilities, db.availabilities);
  }
};

run();
