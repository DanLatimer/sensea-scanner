import { config } from './config.js';
import { isInThePast } from './date-utils/date-utils.js';
import { Emailer } from './emailer/emailer.js';
import { Fetcher } from './fetcher/fetcher.js';
import { Persistence } from './persistence/persistence.js';
import { DBDatesAvailabilities, DateYYYYMMDD } from './types.js';

const getDatesInterested = (): DateYYYYMMDD[] => {
  return config.datesInterested.filter((date) => !isInThePast(date));
};

const run: () => void = async () => {
  const db = new Persistence('./db.json');
  const fetcher = new Fetcher();
  const emailer = new Emailer();
  console.log('Starting Sensea Scanner');

  console.log('------------------------------------------------\n');

  console.log('Interested in these dates: ', getDatesInterested());

  const dates = await fetcher.queryMonthsForDates(getDatesInterested());

  const datesInterestedEmptyResults: DBDatesAvailabilities = Object.fromEntries(
    getDatesInterested().map((date) => [date, {}]),
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
    emailer.sendMail(
      getDatesInterested(),
      newAvailabilities,
      db.availabilities,
    );
  }
};

setInterval(() => run(), config.pollIntervalInSeconds * 1000);
