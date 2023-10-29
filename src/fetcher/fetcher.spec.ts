import { AvailabilitiesForDates } from '../types.js';
import { convertAvailabilitesForDatesFromArrays } from './fetcher.js';

describe('fetcher', () => {
  describe('convertAvailabilitesForDatesFromArrays', () => {
    it('merges AvailabilitiesForDates array into an object', () => {
      const availabilities: AvailabilitiesForDates[] = [
        { '2023-10-15': [] },
        { '2023-10-25': [] },
      ];
      const converted = convertAvailabilitesForDatesFromArrays(availabilities);

      expect(Object.keys(converted)).toContain('2023-10-15');
      expect(Object.keys(converted)).toContain('2023-10-25');
    });

    it('merges timeslots into an object', () => {
      const timeSlotA = { time: '2023-10-25T15:00:00-0300', slotsAvailable: 2 };
      const timeSlotB = { time: '2023-10-25T18:00:00-0300', slotsAvailable: 1 };
      const timeSlots = [
        timeSlotA,
        timeSlotB,
      ];

      const availabilities: AvailabilitiesForDates[] = [
        { '2023-10-15': timeSlots },
      ];
      const convertedDates =
        convertAvailabilitesForDatesFromArrays(availabilities);

      const convertedDate = convertedDates['2023-10-15'];

      expect(Object.keys(convertedDate)).toContain(
        timeSlotA.time,
      );
      expect(convertedDate[timeSlotA.time].slotsAvailable).toBe(timeSlotA.slotsAvailable)

      expect(Object.keys(convertedDate)).toContain(
        timeSlotB.time,
      );
      expect(convertedDate[timeSlotB.time].slotsAvailable).toBe(timeSlotB.slotsAvailable)
    });
  });
});
