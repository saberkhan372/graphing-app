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

const { toFraction } = sandbox;

test('toFraction reduces numbers', () => {
  assert.strictEqual(toFraction(0.75), '3/4');
  assert.strictEqual(toFraction(-2.5), '-5/2');
});
