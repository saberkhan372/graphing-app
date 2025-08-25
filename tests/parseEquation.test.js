import test from 'node:test';
import assert from 'node:assert';
import { parseEquation } from '../app.js';

test('parseEquation handles fractional coefficients', () => {
  assert.deepEqual(
    parseEquation('3x - 1/4 y = -5'),
    { a: 3, b: -0.25, c: -5, hasDecimal: false }
  );
});

test('parseEquation detects decimals', () => {
  assert.deepEqual(
    parseEquation('y = 0.5x + 3'),
    { a: -0.5, b: 1, c: 3, hasDecimal: true }
  );
});
