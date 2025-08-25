import test from 'node:test';
import assert from 'node:assert';
import { toFraction } from '../app.js';

test('toFraction reduces numbers', () => {
  assert.strictEqual(toFraction(0.75), '3/4');
  assert.strictEqual(toFraction(-2.5), '-5/2');
});
