const { toFraction } = require('../app');

describe('toFraction', () => {
  test('converts decimal to simplest fraction', () => {
    expect(toFraction(0.5)).toEqual({ numerator: 1, denominator: 2 });
  });

  test('reduces fractions correctly', () => {
    expect(toFraction(2.75)).toEqual({ numerator: 11, denominator: 4 });
  });
});
