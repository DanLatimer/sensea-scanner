import {
  TimeslotsForDates as DateToTimeslots,
  DayAvailabilities,
  MonthAvailabilities,
  DateYYYYMMDD,
  TimeSlot,
} from '../types.js';

const queryMonthUrl = (firstOfMonth: string): string =>
  `https://sensea.as.me/api/scheduling/v1/availability/month?owner=1e0cc157&appointmentTypeId=15360506&calendarId=3581411&timezone=America%2FHalifax&month=${firstOfMonth}`;
const queryTimesUrl = (date: string): string =>
  `https://sensea.as.me/api/scheduling/v1/availability/times?owner=1e0cc157&appointmentTypeId=15360506&calendarId=3581411&startDate=${date}&timezone=America%2FHalifax`;

export function convertDatesToTimeslotsIntoMonthAvailabilities(
  datesToTimeslots: DateToTimeslots[],
): MonthAvailabilities {
  const convertTimeslotsToDayAvailabilities = (
    timeslots: TimeSlot[],
  ): DayAvailabilities => {
    const dateTimeToTimeslotsEntries = timeslots.map((timeslot) => [
      timeslot.time,
      { slotsAvailable: timeslot.slotsAvailable },
    ]);

    return Object.fromEntries(dateTimeToTimeslotsEntries);
  };

  const mergedDatesToTimeslots = datesToTimeslots.reduce(
    (acc, cur) => ({ ...acc, ...cur }),
    {},
  );

  const monthAvailabilities = Object.fromEntries(
    Object.entries(mergedDatesToTimeslots).map(([date, timeslots]) => [
      date,
      convertTimeslotsToDayAvailabilities(timeslots),
    ]),
  );

  return monthAvailabilities;
}

export class Fetcher {
  public async queryMonthsForDates(
    datesInterested: DateYYYYMMDD[],
  ): Promise<DateYYYYMMDD[]> {
    const monthsInterestedWithDuplicates = datesInterested.map((date) => {
      const [year, month] = date.split('-');
      return `${year}-${month}-01`;
    });

    const monthsInterested = Array.from(
      new Set(monthsInterestedWithDuplicates),
    );

    const monthsQueried = await Promise.all(
      monthsInterested.map((month) => this.queryMonth(month, datesInterested)),
    );

    return monthsQueried.flat();
  }

  public async queryMonth(
    month: DateYYYYMMDD,
    datesInterested: DateYYYYMMDD[],
  ): Promise<DateYYYYMMDD[]> {
    const response = await fetch(queryMonthUrl(month));
    const json = await response.json();

    if (json.error) {
      console.error(`Failed to query month: ${month}`, json);
      console.error(`response`, response);
      return [];
    }

    const datesWithAvailability = Object.entries(json)
      .filter(([_, hasAvailability]) => hasAvailability)
      .map(([date]) => date);

    console.log('Dates this month with availabilities', datesWithAvailability);

    const interestedDatesWithAvailability = datesWithAvailability.filter(
      (date) => datesInterested.includes(date),
    );

    console.log(
      "Dates we're interested in with availablities",
      interestedDatesWithAvailability,
    );

    return interestedDatesWithAvailability;
  }

  public async queryAvailabilities(
    date: DateYYYYMMDD,
  ): Promise<DateToTimeslots> {
    const response = await fetch(queryTimesUrl(date));
    const json = await response.json();

    return json;
  }

  public async queryDates(dates: DateYYYYMMDD[]): Promise<MonthAvailabilities> {
    const availabilitiesForDates = await Promise.all(
      dates.map(this.queryAvailabilities),
    );

    const dbDatesAvailabilities =
      convertDatesToTimeslotsIntoMonthAvailabilities(availabilitiesForDates);

    return dbDatesAvailabilities;
  }
}
