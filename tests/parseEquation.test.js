const { parseEquation } = require('../app');

describe('parseEquation', () => {
  test('parses slope and intercept from linear equation', () => {
    expect(parseEquation('y = 2x + 3')).toEqual({ slope: 2, intercept: 3 });
  });

  test('handles negative slope and intercept', () => {
    expect(parseEquation('y=-x-4')).toEqual({ slope: -1, intercept: -4 });
  });

  test('throws on invalid input', () => {
    expect(() => parseEquation('y = x^2')).toThrow('Invalid linear equation');
  });
});
