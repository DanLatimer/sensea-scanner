import { DBDateAvailabilities, DBDatesAvailabilities } from '../types.js';

export function consolidateDates(
  dates: DBDateAvailabilities,
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
