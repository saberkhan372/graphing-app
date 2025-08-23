function parseEquation(str) {
  if (!str) return null;

  // normalize whitespace, parentheses, and various minus symbols
  str = str
    .replace(/\u2212|\u2013|\u2014|\uFE63|\uFF0D/g, '-')
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
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
  return { a, b, c };
}

function formatNumber(num) {
  return Number.isFinite(num) ? num.toFixed(2) : 'N/A';
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
  const std = `${eq.a.toFixed(2)}x ${formatTerm(eq.b, 'y')} = ${eq.c.toFixed(2)}`;
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

  const traces = [];
  let solHtml = '';

  [eq1, eq2].forEach((eq, idx) => {
    if (!eq) return;
    let xs = [];
    let ys = [];
    if (eq.b !== 0) {
      for (let x = -10; x <= 10; x += 0.1) {
        xs.push(x);
        ys.push((eq.c - eq.a * x) / eq.b);
      }
    } else {
      const xVal = eq.c / eq.a;
      for (let y = -10; y <= 10; y += 0.1) {
        xs.push(xVal);
        ys.push(y);
      }
    }
    traces.push({ x: xs, y: ys, mode: 'lines', name: 'Eq' + (idx + 1) });

    if (eq.a !== 0) {
      const xi = eq.c / eq.a;
      traces.push({ x: [xi], y: [0], mode: 'markers', name: `Eq${idx + 1} x-int` });
      solHtml += `<p>Eq${idx + 1} x-intercept: (${formatNumber(xi)}, 0)</p>`;
    }
    if (eq.b !== 0) {
      const yi = eq.c / eq.b;
      traces.push({ x: [0], y: [yi], mode: 'markers', name: `Eq${idx + 1} y-int` });
      solHtml += `<p>Eq${idx + 1} y-intercept: (0, ${formatNumber(yi)})</p>`;
    }
  });

  if (eq1 && eq2) {
    const det = eq1.a * eq2.b - eq2.a * eq1.b;
    if (Math.abs(det) > 1e-8) {
      const x = (eq1.c * eq2.b - eq2.c * eq1.b) / det;
      const y = (eq1.a * eq2.c - eq2.a * eq1.c) / det;
      traces.push({ x: [x], y: [y], mode: 'markers', marker: { size: 10 }, name: 'Intersection' });
      solHtml += `<p>Intersection: (${formatNumber(x)}, ${formatNumber(y)})</p>`;
    } else {
      solHtml += '<p>No unique intersection</p>';
    }
  }

  const allX = traces.flatMap(t => t.x);
  const allY = traces.flatMap(t => t.y);
  let xMin = Math.min(...allX);
  let xMax = Math.max(...allX);
  let yMin = Math.min(...allY);
  let yMax = Math.max(...allY);
  if (!isFinite(xMin) || !isFinite(xMax)) {
    xMin = -10;
    xMax = 10;
  }
  if (!isFinite(yMin) || !isFinite(yMax)) {
    yMin = -10;
    yMax = 10;
  }
  const padX = (xMax - xMin) * 0.1 || 1;
  const padY = (yMax - yMin) * 0.1 || 1;

  Plotly.newPlot('graph', traces, {
    margin: { t: 10 },
    xaxis: { zeroline: true, range: [xMin - padX, xMax + padX] },
    yaxis: { zeroline: true, range: [yMin - padY, yMax + padY] }
  });

  document.getElementById('solutions').innerHTML = solHtml;
}

document.getElementById('plot-btn').addEventListener('click', plot);
