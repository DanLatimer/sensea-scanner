import { isInThePast } from './date-utils.js';

describe('isInThePast', () => {
  it('should return true for date in the past', () => {
    const result = isInThePast('2023-01-14', new Date('2023-01-15T12:00:00'));
    expect(result).toBe(true);
  });

  it('should return false for same date without time', () => {
    const result = isInThePast('2023-01-15', new Date('2023-01-15'));
    expect(result).toBe(false);
  });

  it('should return false for same date with time', () => {
    const result = isInThePast('2023-01-15', new Date('2023-01-15T12:00:00'));
    expect(result).toBe(false);
  });

  it('should return false for date in the future', () => {
    const result = isInThePast('2023-01-16', new Date('2023-01-15T12:00:00'));
    expect(result).toBe(false);
  });
});
