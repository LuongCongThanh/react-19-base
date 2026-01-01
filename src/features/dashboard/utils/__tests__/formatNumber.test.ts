import { describe, expect, it } from '@jest/globals';

import { formatNumber } from '../formatNumber';

describe('formatNumber', () => {
  it('should format number with locale string', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('should format large numbers correctly', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should format small numbers correctly', () => {
    expect(formatNumber(5)).toBe('5');
  });

  it('should format zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should format negative numbers correctly', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });

  it('should format decimal numbers correctly', () => {
    // Note: toLocaleString() behavior may vary by locale
    const result = formatNumber(1234.56);
    expect(result).toContain('1,234');
  });
});
