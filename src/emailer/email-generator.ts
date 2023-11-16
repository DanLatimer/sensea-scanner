import Mailgen from 'mailgen';
import { ChangedBookings } from '../persistence/persistence.js';
import { MonthAvailabilities } from '../types.js';

export function generateEmailBody(
  datesInterested: string[],
  newAvailabilities: ChangedBookings,
  allAvailabilities: MonthAvailabilities,
): string {
  const { newBookings, newCancellations } = newAvailabilities;

  const totalNewBookings = countAvailabilities(newBookings);
  const totalCancellations = countAvailabilities(newCancellations);

  const mailGenerator = new Mailgen({
    theme: 'cerberus',
    product: {
      name: 'Sensea Scanner',
      link: 'https://danlatimer.ca/',
    },
  });

  const email = {
    body: {
      name: 'Sensea Searcher',
      intro: [
        `Your scanner has detected new cancellations (${totalCancellations}) / new bookings (${totalNewBookings})`,
        'Please view below for additional details.',
        "The dates you've configured Sensea Scanner to monitor are as follows: ",
        datesInterested.join(', '),
      ],
      table: [
        {
          title: 'Newly detected cancellations:',
          data: formatAvailabiltiesAsTable(newCancellations),
        },
        {
          title: 'Newly detected bookings:',
          data: formatAvailabiltiesAsTable(newBookings),
        },
        {
          title: "All availabilities for dates you're interested in:",
          data: formatAvailabiltiesAsTable(allAvailabilities),
        },
      ].filter((table) => table.data.length > 0),
      action: {
        instructions: 'To make a booking, please click here:',
        button: {
          text: 'Book Your Appointment!',
          link: 'https://sensea.as.me/schedule.php',
        },
      },
      goToAction: {
        text: 'Book now!',
        link: 'https://sensea.as.me/schedule.php',
        description: 'Make a Sensea booking',
      },
    },
  };

  const emailBody = mailGenerator.generate(email);

  return emailBody;
}

interface Table {
  date: string;
  time: string;
  slotsAvailable: number;
}

function formatAvailabiltiesAsTable(
  monthAvailabilites: MonthAvailabilities,
): Table[] {
  return Object.entries(monthAvailabilites).flatMap(
    ([date, dayAvailabilities]) => {
      return Object.entries(dayAvailabilities).map(
        ([dateTime, { slotsAvailable }]) => ({
          date,
          time: new Date(dateTime).toLocaleTimeString(),
          slotsAvailable,
        }),
      );
    },
  );
}

function countAvailabilities(monthAvailabilities: MonthAvailabilities): number {
  const datesAvailabilitiesEntries = Object.entries(monthAvailabilities);
  return datesAvailabilitiesEntries.reduce(
    (acc, [_, dateAvailabilities]) =>
      acc + Object.keys(dateAvailabilities).length,
    0,
  );
}
