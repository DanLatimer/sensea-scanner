import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  DBDateAvailabilities,
  DBDatesAvailabilities,
  DateWithTime,
  DateYYYYMMDD,
} from '../types.js';

export interface ChangedBookings {
  newCancellations: DBDateAvailabilities;
  newBookings: DBDateAvailabilities;
}

export class Persistence {
  public availabilities: DBDatesAvailabilities = {};

  public constructor(private filename: string = null) {
    if (!this.filename) {
      return;
    }

    this.loadFromFile(this.filename);
  }

  public loadFromFile(filename: string): void {
    const fileExists = existsSync(filename);
    if (!fileExists) {
      return;
    }

    const fileJSON =
      readFileSync(filename, { encoding: 'utf8', flag: 'r' }) ?? '{}';
    this.addAvailabilities(JSON.parse(fileJSON));
  }

  public removeEmptyDates(): void {
    const nonEmptyEntries = Object.entries(this.availabilities).filter(
      ([_, availabilities]) => Object.keys(availabilities).length > 0,
    );

    this.availabilities = Object.fromEntries(nonEmptyEntries);
  }

  public addAvailabilities(availabilitiesObjectToAdd: DBDatesAvailabilities) {
    this.availabilities = {
      ...this.availabilities,
      ...availabilitiesObjectToAdd,
    };

    this.removeEmptyDates();

    if (this.filename) {
      writeFileSync(
        this.filename,
        JSON.stringify(this.availabilities, null, '  '),
        {
          encoding: 'utf8',
          flag: 'w',
        },
      );
    }
  }

  public identifyNewAvailabilityForDate(
    dateToCheck: DateYYYYMMDD,
    availabilitiesForDateToCheck: DBDateAvailabilities,
  ): ChangedBookings {
    const previousAvailabilities = this.availabilities[dateToCheck] ?? {};

    const currentAvailabilities = availabilitiesForDateToCheck ?? {};

    const newCancellations = Object.entries(currentAvailabilities)
      .map(([date, current]: [DateWithTime, { slotsAvailable: number }]) => {
        const previous = previousAvailabilities[date];

        if (!previous) {
          return [date, current];
        }

        const numberOfNewSlots =
          current.slotsAvailable - (previous.slotsAvailable || 0);

        if (numberOfNewSlots > 0) {
          return [date, { slotsAvailable: numberOfNewSlots }];
        }

        return null;
      })
      .filter((val) => val !== null);
    const newBookings = Object.entries(previousAvailabilities)
      .map(([date, previous]: [DateWithTime, { slotsAvailable: number }]) => {
        const current = currentAvailabilities[date];

        if (!current) {
          return [date, previous];
        }

        const numberOfFewerSlots =
          previous.slotsAvailable - (current.slotsAvailable || 0);

        if (numberOfFewerSlots > 0) {
          return [date, { slotsAvailable: numberOfFewerSlots }];
        }

        return null;
      })
      .filter((val) => val !== null);

    return {
      newCancellations: Object.fromEntries(newCancellations),
      newBookings: Object.fromEntries(newBookings),
    };
  }

  public identifyNewAvailabilitiesForDates(
    toCheckObject: DBDatesAvailabilities,
  ): ChangedBookings {
    const availabilitiesForDates = Object.entries(toCheckObject).map(
      ([dateYYYYMMDD, availabilities]) =>
        this.identifyNewAvailabilityForDate(dateYYYYMMDD, availabilities),
    );

    return availabilitiesForDates.reduce(
      (acc, cur) => ({
        newCancellations: { ...acc.newCancellations, ...cur.newCancellations },
        newBookings: { ...acc.newBookings, ...cur.newBookings },
      }),
      { newCancellations: {}, newBookings: {} },
    );
  }
}
