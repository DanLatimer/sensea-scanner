import * as configModule from '../config.js';
import { Config, RecursivePartial } from '../types.js';
import { shouldNotify } from './should-notify.js';

describe('shouldNotify', () => {
  it.each([
    { shouldNotifyOnNewBookings: true },
    { shouldNotifyOnNewBookings: false },
  ])(
    'should return $shouldNotifyOnNewBookings when has new bookings if shouldNotifyOnNewBookings is $shouldNotifyOnNewBookings',
    ({ shouldNotifyOnNewBookings }) => {
      mockConfig({
        notification: {
          shouldNotifyOnNewBookings,
        },
      });

      const result = shouldNotify({
        newBookings: {
          '2023-01-01': undefined,
        },
        newCancellations: {},
      });

      expect(result).toBe(shouldNotifyOnNewBookings);
    },
  );

  it('should return true if contains new cancellations with slots equal to the configured minimumSlotsToNotify', () => {
    mockConfig({
      notification: {
        minimumSlotsToNotify: 2,
      },
    });

    const result = shouldNotify({
      newBookings: {},
      newCancellations: {
        '2023-01-01': { '2023-01-01T12:00:00Z': { slotsAvailable: 2 } },
      },
    });

    expect(result).toBeTruthy();
  });

  it('should return true if contains new cancellations with slots greater than the configured minimumSlotsToNotify', () => {
    mockConfig({
      notification: {
        minimumSlotsToNotify: 2,
      },
    });

    const result = shouldNotify({
      newBookings: {},
      newCancellations: {
        '2023-01-01': { '2023-01-01T12:00:00Z': { slotsAvailable: 3 } },
      },
    });

    expect(result).toBeTruthy();
  });

  it('should return false if contains new cancellations with slots less than the configured minimumSlotsToNotify', () => {
    mockConfig({
      notification: {
        minimumSlotsToNotify: 2,
      },
    });

    const result = shouldNotify({
      newBookings: {},
      newCancellations: {
        '2023-01-01': { '2023-01-01T12:00:00Z': { slotsAvailable: 1 } },
      },
    });

    expect(result).toBeFalsy();
  });

  it('should return false if contains new cancellations with multiple slots less than the configured minimumSlotsToNotify that add to more than minimumSlotsToNotify', () => {
    mockConfig({
      notification: {
        minimumSlotsToNotify: 2,
      },
    });

    const result = shouldNotify({
      newBookings: {},
      newCancellations: {
        '2023-01-01': {
          '2023-01-01T12:00:00Z': { slotsAvailable: 1 },
          '2023-01-01T13:00:00Z': { slotsAvailable: 1 },
          '2023-01-01T14:00:00Z': { slotsAvailable: 1 },
        },
      },
    });

    expect(result).toBeFalsy();
  });
});

function mockConfig(config: RecursivePartial<Config>): void {
  jest.spyOn(configModule, 'getConfig').mockReturnValue(config as Config);
}
