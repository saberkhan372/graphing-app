function parseEquation(equation) {
  const sanitized = equation.replace(/\s+/g, '');
  const match = sanitized.match(/^y=([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?$/i);
  if (!match) {
    throw new Error('Invalid linear equation');
  }
  const slopeStr = match[1];
  const interceptStr = match[2] || '+0';
  const slope = slopeStr === '' || slopeStr === '+' ? 1 : slopeStr === '-' ? -1 : Number(slopeStr);
  const intercept = Number(interceptStr);
  return { slope, intercept };
}

function toFraction(value) {
  if (Number.isInteger(value)) {
    return { numerator: value, denominator: 1 };
  }
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex === -1) {
    return { numerator: Number(str), denominator: 1 };
  }
  const decimalPlaces = str.length - decimalIndex - 1;
  const denominator = Math.pow(10, decimalPlaces);
  const numerator = Math.round(value * denominator);
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.abs(numerator), denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

module.exports = { parseEquation, toFraction };
