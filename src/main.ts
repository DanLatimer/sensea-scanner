import { getConfig } from './config.js';
import { isInThePast } from './date-utils/date-utils.js';
import { Emailer } from './emailer/emailer.js';
import { shouldNotify } from './emailer/should-notify.js';
import { Fetcher } from './fetcher/fetcher.js';
import { Persistence } from './persistence/persistence.js';
import { MonthAvailabilities, DateYYYYMMDD } from './types.js';

const getDatesInterested = (): DateYYYYMMDD[] => {
  return getConfig().datesInterested.filter((date) => !isInThePast(date));
};

const run: () => void = async () => {
  const db = new Persistence('./db.json');
  const fetcher = new Fetcher();
  const emailer = new Emailer();
  console.log('Starting Sensea Scanner');

  console.log('------------------------------------------------\n');

  console.log('Interested in these dates: ', getDatesInterested());

  const dates = await fetcher.queryMonthsForDates(getDatesInterested());

  const datesInterestedEmptyResults: MonthAvailabilities = Object.fromEntries(
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

  if (shouldNotify(newAvailabilities)) {
    emailer.sendMail(
      getDatesInterested(),
      newAvailabilities,
      db.monthAvailabilities,
    );
  }
};

setInterval(() => run(), getConfig().pollIntervalInSeconds * 1000);
