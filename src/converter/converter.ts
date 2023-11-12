import { DayAvailabilities, DBDatesAvailabilities } from '../types.js';

export function seperateMergedDayAvailabilities(
  mergedDayAvailabilities: DayAvailabilities,
): DBDatesAvailabilities {
  return Object.entries(mergedDayAvailabilities)
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
