import { DayAvailabilities, DBDatesAvailabilities } from '../types.js';

export function consolidateDates(
  dates: DayAvailabilities,
): DBDatesAvailabilities {
  return Object.entries(dates)
    .map(([dateTime, { slotsAvailable }]) => {
      const [dateYYYYMMDD] = dateTime.split('T');
      return {
        dateYYYYMMDD,
        dateTimeToSlots: { [dateTime]: { slotsAvailable } },
      };
    })
    .reduce(
      (acc, { dateYYYYMMDD, dateTimeToSlots }) => ({
        ...acc,
        [dateYYYYMMDD]: { ...(acc[dateYYYYMMDD] ?? {}), ...dateTimeToSlots },
      }),
      {},
    );
}
