
function parseEquation(str) {
  if (!str) return null;

  // normalize whitespace, parentheses, unicode minus signs, and common fractions
  const fracMap = {
    '\u00BC': '1/4', // ¼
    '\u00BD': '1/2', // ½
    '\u00BE': '3/4', // ¾
    '\u2150': '1/7',
    '\u2151': '1/9',
    '\u2152': '1/10',
    '\u2153': '1/3',
    '\u2154': '2/3',
    '\u2155': '1/5',
    '\u2156': '2/5',
    '\u2157': '3/5',
    '\u2158': '4/5',
    '\u2159': '1/6',
    '\u215A': '5/6',
    '\u215B': '1/8',
    '\u215C': '3/8',
    '\u215D': '5/8',
    '\u215E': '7/8'
  };
  str = str
    .replace(/[\u2212\u2010-\u2015\uFE63\uFF0D]/g, '-') // various minus/dash characters
    .replace(/[\u00B7\u22C5\u00D7]/g, '') // multiplication dots / times signs
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
    .replace(/[\u00BC-\u00BE\u2150-\u215E]/g, m => fracMap[m] || m)
    .toLowerCase();

  function parseCoef(s) {
    if (s === '' || s === '+') return 1;
    if (s === '-') return -1;
    if (s.includes('/')) {
      let [num, den] = s.split('/');
      if (num === '' || num === '+') num = 1;
      else if (num === '-') num = -1;
      else num = parseFloat(num);
      den = parseFloat(den);
      if (!isFinite(num) || !isFinite(den) || den === 0) return NaN;
      return num / den;
    }
    return parseFloat(s);
  }

  function parseSide(side) {
    const res = { x: 0, y: 0, const: 0, hasDec: false };
    const terms = side.match(/[+-]?[^+-]+/g);
    if (!terms) return res;
    for (const t of terms) {
      if (t.includes('x')) {
        const coefStr = t.replace('x', '');
        if (coefStr.includes('.')) res.hasDec = true;
        const coef = parseCoef(coefStr);
        if (!isFinite(coef)) return null;
        res.x += coef;
      } else if (t.includes('y')) {
        const coefStr = t.replace('y', '');
        if (coefStr.includes('.')) res.hasDec = true;
        const coef = parseCoef(coefStr);
        if (!isFinite(coef)) return null;
        res.y += coef;
      } else {
        if (t.includes('.')) res.hasDec = true;
        const coef = parseCoef(t);
        if (!isFinite(coef)) return null;
        res.const += coef;
      }
    }
    return res;
  }

  const parts = str.split('=');
  if (parts.length !== 2) return null;
  const left = parseSide(parts[0]);
  const right = parseSide(parts[1]);
  if (!left || !right) return null;

  const a = left.x - right.x;
  const b = left.y - right.y;
  const c = right.const - left.const;
  if (!isFinite(a) || !isFinite(b) || !isFinite(c)) return null;
  if (a === 0 && b === 0) return null;
  const hasDecimal = left.hasDec || right.hasDec;
  return { a, b, c, hasDecimal };
}

function toFraction(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const tolerance = 1e-9;
  let h1 = 1,
    h2 = 0,
    k1 = 0,
    k2 = 1,
    b = x;
  do {
    const a = Math.floor(b);
    [h1, h2] = [a * h1 + h2, h1];
    [k1, k2] = [a * k1 + k2, k1];
    const approx = h1 / k1;
    if (Math.abs(approx - x) <= x * tolerance) break;
    b = 1 / (b - a);
  } while (true);
  const result = k1 === 1 ? `${h1}` : `${h1}/${k1}`;
  return sign < 0 ? `-${result}` : result;
}

function formatValue(num, useDecimal) {
  if (!Number.isFinite(num)) return 'N/A';
  if (useDecimal) return num.toFixed(2);
  return toFraction(num);
}

function formatStandard(eq, useDecimal) {
  const sign = eq.b >= 0 ? '+' : '-';
  const a = formatValue(eq.a, useDecimal);
  const b = formatValue(Math.abs(eq.b), useDecimal);
  const c = formatValue(eq.c, useDecimal);
  return `${a}x ${sign} ${b}y = ${c}`;
}

function displayForms(elemId, eq, raw, useDecimal) {
  const elem = document.getElementById(elemId);
  if (!raw.trim()) {
    elem.textContent = '';
    return;
  }
  if (!eq) {
    elem.textContent = 'Invalid equation';
    return;
  }
  const m = -eq.a / eq.b;
  const b = eq.c / eq.b;
  const formatTerm = (coef, variable) =>
    `${coef >= 0 ? '+' : '-'} ${formatValue(Math.abs(coef), useDecimal)}${variable}`;
  const std = formatStandard(eq, useDecimal);
  const slope = `y = ${formatValue(m, useDecimal)}x ${formatTerm(b, '')}`;
  elem.innerHTML = `\\(${std}\\)<br>\\(${slope}\\)`;
}

function plot() {
  const raw1 = document.getElementById('eq1').value;
  const raw2 = document.getElementById('eq2').value;

  const eq1Parsed = parseEquation(raw1);
  const eq2Parsed = parseEquation(raw2);

  const data = [
    { raw: raw1, eq: eq1Parsed, useDec: eq1Parsed ? eq1Parsed.hasDecimal : false },
    { raw: raw2, eq: eq2Parsed, useDec: eq2Parsed ? eq2Parsed.hasDecimal : false }
  ];

  // Show equation forms for each input
  data.forEach((d, i) => {
    displayForms(`eq${i + 1}-forms`, d.eq, d.raw, d.useDec);
  });

  // Collect valid equations and intercepts
  const equations = [];
  const xVals = [0];
  const yVals = [0];
  data.forEach(d => {
    if (d.eq) {
      const xi = d.eq.a !== 0 ? d.eq.c / d.eq.a : null;
      const yi = d.eq.b !== 0 ? d.eq.c / d.eq.b : null;
      if (xi !== null && isFinite(xi)) xVals.push(xi);
      if (yi !== null && isFinite(yi)) yVals.push(yi);
      equations.push({ ...d, xi, yi });
    }
  });

  // Intersection
  let intersection = null;
  const eq1 = data[0].eq;
  const eq2 = data[1].eq;
  const useDecInter = data[0].useDec || data[1].useDec;
  if (eq1 && eq2) {
    const det = eq1.a * eq2.b - eq2.a * eq1.b;
    if (Math.abs(det) > 1e-8) {
      const x = (eq1.c * eq2.b - eq2.c * eq1.b) / det;
      const y = (eq1.a * eq2.c - eq2.a * eq1.c) / det;
      intersection = { x, y };
      if (isFinite(x)) xVals.push(x);
      if (isFinite(y)) yVals.push(y);
    }
  }

  const finiteX = xVals.filter(isFinite);
  const finiteY = yVals.filter(isFinite);
  let xMin = finiteX.length ? Math.min(...finiteX) : -10;
  let xMax = finiteX.length ? Math.max(...finiteX) : 10;
  let yMin = finiteY.length ? Math.min(...finiteY) : -10;
  let yMax = finiteY.length ? Math.max(...finiteY) : 10;
  const padX = (xMax - xMin) * 0.2 || 1;
  const padY = (yMax - yMin) * 0.2 || 1;
  xMin -= padX;
  xMax += padX;
  yMin -= padY;
  yMax += padY;

  const traces = [];
  let solHtml = '';

  equations.forEach((d, idx) => {
    const { eq, useDec, xi, yi } = d;
    let xs = [];
    let ys = [];
    if (eq.b !== 0) {
      const m = -eq.a / eq.b;
      const b = eq.c / eq.b;
      xs = [xMin, xMax];
      ys = xs.map(x => m * x + b);
    } else {
      const xVal = eq.c / eq.a;
      xs = [xVal, xVal];
      ys = [yMin, yMax];
    }
    traces.push({ x: xs, y: ys, mode: 'lines', name: 'Eq' + (idx + 1) });

    let block = `<div class='solution-block'><h3>Equation ${idx + 1}</h3>`;
    block += `<p>Standard form: \\(${formatStandard(eq, useDec)}\\)</p>`;

    if (xi !== null) {
      traces.push({ x: [xi], y: [0], mode: 'markers', name: 'Eq' + (idx + 1) + ' x-int' });
      const sign = eq.b >= 0 ? '+' : '-';
      block += `<p><strong>x-intercept</strong></p><ol>`;
      block += `<li>\\(${formatValue(eq.a, useDec)}x ${sign} ${formatValue(Math.abs(eq.b), useDec)}\\cdot0 = ${formatValue(eq.c, useDec)}\\)</li>`;
      block += `<li>\\(${formatValue(eq.a, useDec)}x = ${formatValue(eq.c, useDec)}\\)</li>`;
      block += `<li>\\(x = ${formatValue(xi, useDec)}\\)</li>`;
      block += `</ol><p>So the x-intercept is \\((${formatValue(xi, useDec)}, 0)\\)</p>`;
    } else {
      block += `<p>No x-intercept</p>`;
    }

    if (yi !== null) {
      traces.push({ x: [0], y: [yi], mode: 'markers', name: 'Eq' + (idx + 1) + ' y-int' });
      const sign = eq.a >= 0 ? '+' : '-';
      block += `<p><strong>y-intercept</strong></p><ol>`;
      block += `<li>\\(${formatValue(eq.a, useDec)}\\cdot0 ${sign} ${formatValue(Math.abs(eq.b), useDec)}y = ${formatValue(eq.c, useDec)}\\)</li>`;
      block += `<li>\\(${formatValue(eq.b, useDec)}y = ${formatValue(eq.c, useDec)}\\)</li>`;
      block += `<li>\\(y = ${formatValue(yi, useDec)}\\)</li>`;
      block += `</ol><p>So the y-intercept is \\(0, ${formatValue(yi, useDec)}\\)</p>`;
    } else {
      block += `<p>No y-intercept</p>`;
    }

    block += `</div>`;
    solHtml += block;
  });

  if (intersection) {
    traces.push({ x: [intersection.x], y: [intersection.y], mode: 'markers', marker: { size: 10 }, name: 'Intersection' });
    let inter = `<div class='solution-block'><h3>Intersection</h3>`;
    if (eq1.b !== 0 && eq2.b !== 0) {
      inter += '<p>Eliminate y:</p><ol>';
      inter += `<li>Multiply Eq1 by ${formatValue(eq2.b, useDecInter)} and Eq2 by ${formatValue(eq1.b, useDecInter)}.</li>`;
      const coeff1 = formatValue(eq1.a * eq2.b, useDecInter);
      const coeff2 = formatValue(eq2.a * eq1.b, useDecInter);
      const const1 = formatValue(eq1.c * eq2.b, useDecInter);
      const const2 = formatValue(eq2.c * eq1.b, useDecInter);
      inter += `<li>Subtract to eliminate y: \\(${coeff1}x - ${coeff2}x = ${const1} - ${const2}\\)</li>`;
      inter += `<li>\\(${formatValue(eq1.a * eq2.b - eq2.a * eq1.b, useDecInter)}x = ${formatValue(eq1.c * eq2.b - eq2.c * eq1.b, useDecInter)}\\)</li>`;
      inter += `<li>\\(x = ${formatValue(intersection.x, useDecInter)}\\)</li></ol>`;
      inter += '<p>Substitute x into Eq1:</p><ol>';
      const sign = eq1.b >= 0 ? '+' : '-';
      inter += `<li>\\(${formatValue(eq1.a, useDecInter)}(${formatValue(intersection.x, useDecInter)}) ${sign} ${formatValue(Math.abs(eq1.b), useDecInter)}y = ${formatValue(eq1.c, useDecInter)}\\)</li>`;
      inter += `<li>\\(${formatValue(eq1.a * intersection.x, useDecInter)} ${sign} ${formatValue(Math.abs(eq1.b), useDecInter)}y = ${formatValue(eq1.c, useDecInter)}\\)</li>`;
      inter += `<li>\\(${formatValue(eq1.b, useDecInter)}y = ${formatValue(eq1.c - eq1.a * intersection.x, useDecInter)}\\)</li>`;
      inter += `<li>\\(y = ${formatValue(intersection.y, useDecInter)}\\)</li></ol>`;
    } else if (eq1.b === 0 && eq2.b !== 0) {
      const x1 = eq1.c / eq1.a;
      inter += `<p>Eq1 is vertical: \\(x = ${formatValue(x1, useDecInter)}\\)</p>`;
      inter += '<p>Substitute into Eq2:</p><ol>';
      const sign = eq2.b >= 0 ? '+' : '-';
      inter += `<li>\\(${formatValue(eq2.a, useDecInter)}(${formatValue(x1, useDecInter)}) ${sign} ${formatValue(Math.abs(eq2.b), useDecInter)}y = ${formatValue(eq2.c, useDecInter)}\\)</li>`;
      inter += `<li>\\(${formatValue(eq2.a * x1, useDecInter)} ${sign} ${formatValue(Math.abs(eq2.b), useDecInter)}y = ${formatValue(eq2.c, useDecInter)}\\)</li>`;
      inter += `<li>\\(${formatValue(eq2.b, useDecInter)}y = ${formatValue(eq2.c - eq2.a * x1, useDecInter)}\\)</li>`;
      inter += `<li>\\(y = ${formatValue(intersection.y, useDecInter)}\\)</li></ol>`;
    } else if (eq2.b === 0 && eq1.b !== 0) {
      const x2 = eq2.c / eq2.a;
      inter += `<p>Eq2 is vertical: \\(x = ${formatValue(x2, useDecInter)}\\)</p>`;
      inter += '<p>Substitute into Eq1:</p><ol>';
      const sign = eq1.b >= 0 ? '+' : '-';
      inter += `<li>\\(${formatValue(eq1.a, useDecInter)}(${formatValue(x2, useDecInter)}) ${sign} ${formatValue(Math.abs(eq1.b), useDecInter)}y = ${formatValue(eq1.c, useDecInter)}\\)</li>`;
      inter += `<li>\\(${formatValue(eq1.a * x2, useDecInter)} ${sign} ${formatValue(Math.abs(eq1.b), useDecInter)}y = ${formatValue(eq1.c, useDecInter)}\\)</li>`;
      inter += `<li>\\(${formatValue(eq1.b, useDecInter)}y = ${formatValue(eq1.c - eq1.a * x2, useDecInter)}\\)</li>`;
      inter += `<li>\\(y = ${formatValue(intersection.y, useDecInter)}\\)</li></ol>`;
    } else {
      inter += '<p>Both lines are vertical. No single intersection point.</p>';
    }
    inter += `<p>Intersection point: \\(${formatValue(intersection.x, useDecInter)}, ${formatValue(intersection.y, useDecInter)}\\)</p>`;
    inter += '</div>';
    solHtml += inter;
  } else if (eq1 && eq2) {
    solHtml += '<p>No unique intersection</p>';
  }

  // Plotly auto-scales around data
  Plotly.newPlot('graph', traces, {
    margin: { t: 10 },
    xaxis: { zeroline: true, autorange: true },
    yaxis: { zeroline: true, autorange: true }
  });

  document.getElementById('solutions').innerHTML = solHtml;
  if (window.MathJax) MathJax.typesetPromise();
}

document.getElementById('plot-btn').addEventListener('click', plot);
<<<