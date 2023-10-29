import {
  AvailabilitiesForDates,
  DBDatesAvailabilities,
  DateYYYYMMDD,
  TimeSlot,
} from '../types.js';

const queryMonthUrl = (firstOfMonth) =>
  `https://sensea.as.me/api/scheduling/v1/availability/month?owner=1e0cc157&appointmentTypeId=15360506&calendarId=3581411&timezone=America%2FHalifax&month=${firstOfMonth}`;
const queryTimesUrl = (date) =>
  `https://sensea.as.me/api/scheduling/v1/availability/times?owner=1e0cc157&appointmentTypeId=15360506&calendarId=3581411&startDate=${date}&timezone=America%2FHalifax`;

export function convertAvailabilitesForDatesFromArrays(
  original: AvailabilitiesForDates[],
): DBDatesAvailabilities {
  const convertAvailabilitiesForDate = (availabilities: TimeSlot[]) => {
    const dateTimeToAvailabilitiesObject = availabilities.map(
      (availability) => [
        availability.time,
        { slotsAvailable: availability.slotsAvailable },
      ],
    );

    return Object.fromEntries(dateTimeToAvailabilitiesObject);
  };

  const merged = original.reduce((acc, cur) => ({ ...acc, ...cur }), {});

  const final = Object.fromEntries(
    Object.entries(merged).map(([date, availabilities]) => [
      date,
      convertAvailabilitiesForDate(availabilities),
    ]),
  );

  return final;
}

export class Fetcher {
  public async queryMonthsForDates(
    datesInterested: DateYYYYMMDD[] /* Eg. ['2023-10-15', '2023-10-15'] */,
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

  // Date = 'YYYY-MM-DD
  // Returns dates of moth with availabilities Date[] Eg. ['2023-10-15', '2023-10-15']
  public async queryMonth(
    month: DateYYYYMMDD,
    datesInterested: DateYYYYMMDD[] /* Eg. ['2023-10-15', '2023-10-15'] */,
  ): Promise<DateYYYYMMDD[]> {
    const response = await fetch(queryMonthUrl(month));
    const json = await response.json();

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

  // {'2023-10-13': [{time: '2023-10-13T10:20:00-0300', slotsAvailable: 1 },]}
  // returns availabilities for a given date {[Date]: {time: IsoDateTime; slotsAvailable: number}[]} Eg. {'2023-10-13': [{time: '2023-10-13T10:20:00-0300', slotsAvailable: 1 },]}
  public async queryAvailabilities(
    date: DateYYYYMMDD,
  ): Promise<AvailabilitiesForDates> {
    const response = await fetch(queryTimesUrl(date));
    const json = await response.json();

    return json;
  }

  public async queryDates(
    dates: DateYYYYMMDD[],
  ): Promise<DBDatesAvailabilities> {
    const availabilitiesForDates = await Promise.all(
      dates.map(this.queryAvailabilities),
    );

    const dbDatesAvailabilities = convertAvailabilitesForDatesFromArrays(
      availabilitiesForDates,
    );

    return dbDatesAvailabilities;
  }
}
