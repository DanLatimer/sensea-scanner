import { DateYYYYMMDD } from '../types.js';

export function isInThePast(
  dateTime: DateYYYYMMDD,
  currentDateTime: Date = new Date(),
): boolean {
  const currentDate = new Date(
    currentDateTime.getFullYear(),
    currentDateTime.getMonth(),
    currentDateTime.getDate(),
  );

  const [year, month, day] = dateTime
    .split('-')
    .map((component) => Number(component));
  const zeroIndexedMonth = month - 1;
  const date = new Date(year, zeroIndexedMonth, day);

  return date.getTime() < currentDate.getTime();
}
