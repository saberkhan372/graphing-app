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
    const res = { x: 0, y: 0, const: 0 };
    const terms = side.match(/[+-]?[^+-]+/g);
    if (!terms) return res;
    for (const t of terms) {
      if (t.includes('x')) {
        const coef = parseCoef(t.replace('x', ''));
        if (!isFinite(coef)) return null;
        res.x += coef;
      } else if (t.includes('y')) {
        const coef = parseCoef(t.replace('y', ''));
        if (!isFinite(coef)) return null;
        res.y += coef;
      } else {
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
  return { a, b, c };
}

function formatNumber(num) {
  return Number.isFinite(num) ? num.toFixed(2) : 'N/A';
}

function formatStandard(eq) {
  const sign = eq.b >= 0 ? '+' : '-';
  return `${eq.a.toFixed(2)}x ${sign} ${Math.abs(eq.b).toFixed(2)}y = ${eq.c.toFixed(2)}`;
}

function displayForms(elemId, eq, raw) {
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
    `${coef >= 0 ? '+' : '-'} ${Math.abs(coef).toFixed(2)}${variable}`;
  const std = formatStandard(eq);
  const slope = `y = ${m.toFixed(2)}x ${formatTerm(b, '')}`;
  elem.textContent = std + '\n' + slope;
}

function plot() {
  const raw1 = document.getElementById('eq1').value;
  const raw2 = document.getElementById('eq2').value;
  const eq1 = parseEquation(raw1);
  const eq2 = parseEquation(raw2);

  displayForms('eq1-forms', eq1, raw1);
  displayForms('eq2-forms', eq2, raw2);

  const equations = [eq1, eq2].filter(Boolean);
  const intercepts = [];
  const xVals = [0];
  const yVals = [0];

  equations.forEach(eq => {
    const xi = eq.a !== 0 ? eq.c / eq.a : null;
    const yi = eq.b !== 0 ? eq.c / eq.b : null;
    intercepts.push({ xi, yi });
    if (xi !== null && isFinite(xi)) xVals.push(xi);
    if (yi !== null && isFinite(yi)) yVals.push(yi);
  });

  let intersection = null;
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

  equations.forEach((eq, idx) => {
    const { xi, yi } = intercepts[idx];
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

    let block = `<div class="solution-block"><h3>Equation ${idx + 1}</h3>`;
    block += `<p>Standard form: ${formatStandard(eq)}</p>`;

    if (xi !== null) {
      traces.push({ x: [xi], y: [0], mode: 'markers', name: `Eq${idx + 1} x-int` });
      const sign = eq.b >= 0 ? '+' : '-';
      block += `<p><strong>x-intercept</strong></p><ol>`;
      block += `<li>Set y = 0: ${eq.a.toFixed(2)}x ${sign} ${Math.abs(eq.b).toFixed(2)}·0 = ${eq.c.toFixed(2)}</li>`;
      block += `<li>Simplify: ${eq.a.toFixed(2)}x = ${eq.c.toFixed(2)}</li>`;
      block += `<li>Solve: x = ${formatNumber(xi)}</li>`;
      block += `</ol><p>So the x-intercept is (${formatNumber(xi)}, 0)</p>`;
    } else {
      block += `<p>No x-intercept</p>`;
    }

    if (yi !== null) {
      traces.push({ x: [0], y: [yi], mode: 'markers', name: `Eq${idx + 1} y-int` });
      const sign = eq.a >= 0 ? '+' : '-';
      block += `<p><strong>y-intercept</strong></p><ol>`;
      block += `<li>Set x = 0: ${eq.a.toFixed(2)}·0 ${sign} ${Math.abs(eq.b).toFixed(2)}y = ${eq.c.toFixed(2)}</li>`;
      block += `<li>Simplify: ${eq.b.toFixed(2)}y = ${eq.c.toFixed(2)}</li>`;
      block += `<li>Solve: y = ${formatNumber(yi)}</li>`;
      block += `</ol><p>So the y-intercept is (0, ${formatNumber(yi)})</p>`;
    } else {
      block += `<p>No y-intercept</p>`;
    }

    block += `</div>`;
    solHtml += block;
  });

  if (intersection) {
    traces.push({ x: [intersection.x], y: [intersection.y], mode: 'markers', marker: { size: 10 }, name: 'Intersection' });
    let inter = '<div class="solution-block"><h3>Intersection</h3>';
    if (eq1.b !== 0 && eq2.b !== 0) {
      inter += '<p>Eliminate y:</p><ol>';
      inter += `<li>Multiply Eq1 by ${eq2.b.toFixed(2)} and Eq2 by ${eq1.b.toFixed(2)}.</li>`;
      const coeff1 = (eq1.a * eq2.b).toFixed(2);
      const coeff2 = (eq2.a * eq1.b).toFixed(2);
      const const1 = (eq1.c * eq2.b).toFixed(2);
      const const2 = (eq2.c * eq1.b).toFixed(2);
      inter += `<li>Subtract to eliminate y: ${coeff1}x - ${coeff2}x = ${const1} - ${const2}</li>`;
      inter += `<li>${(eq1.a * eq2.b - eq2.a * eq1.b).toFixed(2)}x = ${(eq1.c * eq2.b - eq2.c * eq1.b).toFixed(2)}</li>`;
      inter += `<li>x = ${formatNumber(intersection.x)}</li></ol>`;
      inter += '<p>Substitute x into Eq1:</p><ol>';
      const sign = eq1.b >= 0 ? '+' : '-';
      inter += `<li>${eq1.a.toFixed(2)}(${formatNumber(intersection.x)}) ${sign} ${Math.abs(eq1.b).toFixed(2)}y = ${eq1.c.toFixed(2)}</li>`;
      inter += `<li>${(eq1.a * intersection.x).toFixed(2)} ${sign} ${Math.abs(eq1.b).toFixed(2)}y = ${eq1.c.toFixed(2)}</li>`;
      inter += `<li>${eq1.b.toFixed(2)}y = ${(eq1.c - eq1.a * intersection.x).toFixed(2)}</li>`;
      inter += `<li>y = ${formatNumber(intersection.y)}</li></ol>`;
    } else if (eq1.b === 0 && eq2.b !== 0) {
      const x1 = eq1.c / eq1.a;
      inter += `<p>Eq1 is vertical: x = ${formatNumber(x1)}</p>`;
      inter += '<p>Substitute into Eq2:</p><ol>';
      const sign = eq2.b >= 0 ? '+' : '-';
      inter += `<li>${eq2.a.toFixed(2)}(${formatNumber(x1)}) ${sign} ${Math.abs(eq2.b).toFixed(2)}y = ${eq2.c.toFixed(2)}</li>`;
      inter += `<li>${(eq2.a * x1).toFixed(2)} ${sign} ${Math.abs(eq2.b).toFixed(2)}y = ${eq2.c.toFixed(2)}</li>`;
      inter += `<li>${eq2.b.toFixed(2)}y = ${(eq2.c - eq2.a * x1).toFixed(2)}</li>`;
      inter += `<li>y = ${formatNumber(intersection.y)}</li></ol>`;
    } else if (eq2.b === 0 && eq1.b !== 0) {
      const x2 = eq2.c / eq2.a;
      inter += `<p>Eq2 is vertical: x = ${formatNumber(x2)}</p>`;
      inter += '<p>Substitute into Eq1:</p><ol>';
      const sign = eq1.b >= 0 ? '+' : '-';
      inter += `<li>${eq1.a.toFixed(2)}(${formatNumber(x2)}) ${sign} ${Math.abs(eq1.b).toFixed(2)}y = ${eq1.c.toFixed(2)}</li>`;
      inter += `<li>${(eq1.a * x2).toFixed(2)} ${sign} ${Math.abs(eq1.b).toFixed(2)}y = ${eq1.c.toFixed(2)}</li>`;
      inter += `<li>${eq1.b.toFixed(2)}y = ${(eq1.c - eq1.a * x2).toFixed(2)}</li>`;
      inter += `<li>y = ${formatNumber(intersection.y)}</li></ol>`;
    } else {
      inter += '<p>Both lines are vertical. No single intersection point.</p>';
    }
    inter += `<p>Intersection point: (${formatNumber(intersection.x)}, ${formatNumber(intersection.y)})</p>`;
    inter += '</div>';
    solHtml += inter;
  } else if (eq1 && eq2) {
    solHtml += '<p>No unique intersection</p>';
  }

  Plotly.newPlot('graph', traces, {
    margin: { t: 10 },
    xaxis: { zeroline: true, range: [xMin, xMax] },
    yaxis: { zeroline: true, range: [yMin, yMax] }
  });

  document.getElementById('solutions').innerHTML = solHtml;
}

document.getElementById('plot-btn').addEventListener('click', plot);
