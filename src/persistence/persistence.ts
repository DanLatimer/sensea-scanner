import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  DayAvailabilities,
  MonthAvailabilities,
  DateWithTime,
  DateYYYYMMDD,
} from '../types.js';
import { seperateMergedDayAvailabilities } from '../converter/converter.js';

export interface ChangedBookings {
  newCancellations: MonthAvailabilities;
  newBookings: MonthAvailabilities;
}

export class Persistence {
  public monthAvailabilities: MonthAvailabilities = {};

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
      readFileSync(filename, { encoding: 'utf8', flag: 'r' }).trim() || '{}';
    this.addAvailabilities(JSON.parse(fileJSON));
  }

  public removeEmptyDates(): void {
    const nonEmptyEntries = Object.entries(this.monthAvailabilities).filter(
      ([_, availabilities]) => Object.keys(availabilities).length > 0,
    );

    this.monthAvailabilities = Object.fromEntries(nonEmptyEntries);
  }

  public addAvailabilities(
    monthAvailabilitiesToAdd: MonthAvailabilities,
  ): void {
    this.monthAvailabilities = {
      ...this.monthAvailabilities,
      ...monthAvailabilitiesToAdd,
    };

    this.removeEmptyDates();

    if (this.filename) {
      writeFileSync(
        this.filename,
        JSON.stringify(this.monthAvailabilities, null, '  '),
        {
          encoding: 'utf8',
          flag: 'w',
        },
      );
    }
  }

  public identifyNewAvailabilityForDate(
    dateToCheck: DateYYYYMMDD,
    dayAvailabilities: DayAvailabilities,
  ): ChangedBookings {
    const previousAvailabilities = this.monthAvailabilities[dateToCheck] ?? {};

    const currentAvailabilities = dayAvailabilities ?? {};

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
      newCancellations: seperateMergedDayAvailabilities(
        Object.fromEntries(newCancellations),
      ),
      newBookings: seperateMergedDayAvailabilities(
        Object.fromEntries(newBookings),
      ),
    };
  }

  public identifyNewAvailabilitiesForDates(
    toCheckObject: MonthAvailabilities,
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
