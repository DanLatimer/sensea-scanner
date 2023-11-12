import { DayAvailabilities } from '../types.js';
import { consolidateDates } from './converter.js';

describe('converter', () => {
  describe('consolidateDates', () => {
    it('should consolidate same day', () => {
      const before: DayAvailabilities = {
        '2023-10-01T10:00:00.000Z': { slotsAvailable: null },
        '2023-10-01T12:00:00.000Z': { slotsAvailable: null },
      };

      const after = consolidateDates(before);

      expect(after).toStrictEqual({ '2023-10-01': before });
    });

    it('should maintain slotsAvailable after consolidating', () => {
      const before: DayAvailabilities = {
        '2023-10-01T10:00:00.000Z': { slotsAvailable: 1 },
        '2023-10-01T12:00:00.000Z': { slotsAvailable: 2 },
      };

      const after = consolidateDates(before);

      expect(after).toStrictEqual({ '2023-10-01': before });
    });

    it('should group different days into their own entries', () => {
      const oct1 = { '2023-10-01T10:00:00.000Z': { slotsAvailable: null } };
      const oct2 = { '2023-10-02T12:00:00.000Z': { slotsAvailable: null } };

      const before: DayAvailabilities = { ...oct1, ...oct2 };

      const after = consolidateDates(before);

      expect(after).toStrictEqual({ '2023-10-01': oct1, '2023-10-02': oct2 });
    });

    it('should group regardless of order', () => {
      const oct1Noon = { '2023-10-01T12:00:00.000Z': { slotsAvailable: null } };
      const oct2 = { '2023-10-02T12:00:00.000Z': { slotsAvailable: null } };
      const oct1Dinner = {
        '2023-10-01T17:00:00.000Z': { slotsAvailable: null },
      };

      const before: DayAvailabilities = {
        ...oct1Noon,
        ...oct2,
        ...oct1Dinner,
      };

      const after = consolidateDates(before);

      expect(after).toStrictEqual({
        '2023-10-01': { ...oct1Noon, ...oct1Dinner },
        '2023-10-02': oct2,
      });
    });
  });
});
