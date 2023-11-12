import { TimeslotsForDates } from '../types.js';
import { convertDatesToTimeslotsIntoMonthAvailabilities } from './fetcher.js';

describe('fetcher', () => {
  describe('convertDatesToTimeslotsIntoDBDatesAvailabilities', () => {
    it('merges timeslotsForDates array into an object', () => {
      const timeslotsForDates: TimeslotsForDates[] = [
        { '2023-10-15': [] },
        { '2023-10-25': [] },
      ];
      const converted =
        convertDatesToTimeslotsIntoMonthAvailabilities(timeslotsForDates);

      expect(Object.keys(converted)).toContain('2023-10-15');
      expect(Object.keys(converted)).toContain('2023-10-25');
    });

    it('merges timeslots into an object', () => {
      const timeSlotA = { time: '2023-10-25T15:00:00-0300', slotsAvailable: 2 };
      const timeSlotB = { time: '2023-10-25T18:00:00-0300', slotsAvailable: 1 };
      const timeSlots = [timeSlotA, timeSlotB];

      const timeslotsForDates: TimeslotsForDates[] = [
        { '2023-10-15': timeSlots },
      ];
      const convertedDBDatesAvailabilities =
        convertDatesToTimeslotsIntoMonthAvailabilities(timeslotsForDates);

      const convertedDayAvailabilities =
        convertedDBDatesAvailabilities['2023-10-15'];

      expect(Object.keys(convertedDayAvailabilities)).toContain(timeSlotA.time);
      expect(convertedDayAvailabilities[timeSlotA.time].slotsAvailable).toBe(
        timeSlotA.slotsAvailable,
      );

      expect(Object.keys(convertedDayAvailabilities)).toContain(timeSlotB.time);
      expect(convertedDayAvailabilities[timeSlotB.time].slotsAvailable).toBe(
        timeSlotB.slotsAvailable,
      );
    });
  });
});
