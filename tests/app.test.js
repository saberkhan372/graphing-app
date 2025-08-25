import { readFileSync } from 'fs';
import { runInNewContext } from 'vm';
import test from 'node:test';
import assert from 'node:assert';

const code = readFileSync(new URL('../app.js', import.meta.url));
const sandbox = {
  document: { getElementById: () => ({ addEventListener: () => {} }) },
  window: {},
  MathJax: {},
  Plotly: { newPlot: () => {} }
};
runInNewContext(code, sandbox);

const { parseEquation, toFraction } = sandbox;

test('parseEquation handles fractional coefficients', () => {
  assert.deepEqual(parseEquation('3x - 1/4 y = -5'), { a: 3, b: -0.25, c: -5, hasDecimal: false });
});

test('parseEquation detects decimals', () => {
  assert.deepEqual(parseEquation('y = 0.5x + 3'), { a: -0.5, b: 1, c: 3, hasDecimal: true });
});

test('toFraction reduces numbers', () => {
  assert.strictEqual(toFraction(0.75), '3/4');
  assert.strictEqual(toFraction(-2.5), '-5/2');
});
