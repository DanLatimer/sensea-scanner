import { Persistence } from './persistence.js';

describe('persistence', () => {
  // {
  //     '2023-10-16': {
  //       '2023-10-16T12:20:00-0300': { slotsAvailable: 1 },
  //       '2023-10-16T12:40:00-0300': { slotsAvailable: 1 }
  //     },
  //     '2023-10-25': { '2023-10-25T15:00:00-0300': { slotsAvailable: 2 } }
  //   }
  // export type DBDateAvailabilities = {[datetime: DateWithTime]: {slotsAvailable: number}}
  // export type DBDatesAvailabilities = {[date: DateYYYYMMDD]: DBDateAvailabilities};
  describe('identifyNewAvailabilitiesForDates', () => {
    it('new date available', () => {
      const persistence = new Persistence();

      const result = persistence.identifyNewAvailabilitiesForDates({
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 1 } },
      });

      expect(result.newCancellations).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });
      expect(result.newBookings).toStrictEqual({});
    });

    it('new dates available', () => {
      const persistence = new Persistence();

      const result = persistence.identifyNewAvailabilitiesForDates({
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 1 } },
        '2023-10-25': { '2023-10-25T12:20:00-0300': { slotsAvailable: 2 } },
      });

      expect(result.newCancellations).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
        '2023-10-25T12:20:00-0300': { slotsAvailable: 2 },
      });

      expect(result.newBookings).toStrictEqual({});
    });

    it('date no longer available', () => {
      const persistence = new Persistence();
      const persisted = {
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 1 } },
      };
      persistence.addAvailabilities(persisted);

      const result = persistence.identifyNewAvailabilitiesForDates({
        '2023-10-15': {},
      });

      expect(result.newCancellations).toStrictEqual({});
      expect(result.newBookings).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });
    });

    it('dates no longer available', () => {
      const persistence = new Persistence();
      const persisted = {
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 1 } },
        '2023-10-25': { '2023-10-25T12:20:00-0300': { slotsAvailable: 2 } },
      };
      persistence.addAvailabilities(persisted);

      const result = persistence.identifyNewAvailabilitiesForDates({
        '2023-10-15': {},
        '2023-10-25': {},
      });

      expect(result.newCancellations).toStrictEqual({});
      expect(result.newBookings).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
        '2023-10-25T12:20:00-0300': { slotsAvailable: 2 },
      });
    });
  });

  describe('identifyNewAvailabilityForDate', () => {
    it('new date available', () => {
      const persistence = new Persistence();

      const result = persistence.identifyNewAvailabilityForDate('2023-10-15', {
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });

      expect(result.newCancellations).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });
      expect(result.newBookings).toStrictEqual({});
    });

    it('date no longer available', () => {
      const persistence = new Persistence();
      const persisted = {
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 1 } },
      };
      persistence.addAvailabilities(persisted);

      const result = persistence.identifyNewAvailabilityForDate(
        '2023-10-15',
        {},
      );

      expect(result.newCancellations).toStrictEqual({});
      expect(result.newBookings).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });
    });

    it('one more slot available', () => {
      const persistence = new Persistence();
      const persisted = {
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 1 } },
      };
      persistence.addAvailabilities(persisted);

      const result = persistence.identifyNewAvailabilityForDate('2023-10-15', {
        '2023-10-15T12:20:00-0300': { slotsAvailable: 2 },
      });

      expect(result.newCancellations).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });
      expect(result.newBookings).toStrictEqual({});
    });

    it('one less slot available', () => {
      const persistence = new Persistence();
      const persisted = {
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 2 } },
      };
      persistence.addAvailabilities(persisted);

      const result = persistence.identifyNewAvailabilityForDate('2023-10-15', {
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });

      expect(result.newCancellations).toStrictEqual({});
      expect(result.newBookings).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 1 },
      });
    });
  });

  describe('addAvailabilities', () => {
    it('should clear empty dates', () => {
      const persistence = new Persistence();
      persistence.addAvailabilities({ '2023-10-15': {} });
      expect(persistence.availabilities['2023-10-15']).toBeUndefined();
    });

    it('should persist dates with availabilities', () => {
      const persistence = new Persistence();
      persistence.addAvailabilities({
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 2 } },
      });
      expect(persistence.availabilities['2023-10-15']).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 2 },
      });
    });

    it('should keep dates with availabilities when filtering out empty dates', () => {
      const persistence = new Persistence();
      persistence.addAvailabilities({
        '2023-10-14': {},
        '2023-10-15': { '2023-10-15T12:20:00-0300': { slotsAvailable: 2 } },
      });
      expect(persistence.availabilities['2023-10-14']).toBeUndefined();
      expect(persistence.availabilities['2023-10-15']).toStrictEqual({
        '2023-10-15T12:20:00-0300': { slotsAvailable: 2 },
      });
    });
  });
});
