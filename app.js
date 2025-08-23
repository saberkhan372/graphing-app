function parseEquation(str) {
  if (!str) return null;
  str = str.replace(/\s+/g, '').toLowerCase();

  function parseCoef(s) {
    if (s === '' || s === '+') return 1;
    if (s === '-') return -1;
    if (s.includes('/')) {
      const [num, den] = s.split('/').map(parseFloat);
      if (!isFinite(num) || !isFinite(den) || den === 0) return NaN;
      return num / den;
    }
    return parseFloat(s);
  }

  // y = mx + b
  let slope = str.match(/^y=([+-]?[\d./]*)x([+-][\d./]*)?$/);
  if (slope) {
    let m = parseCoef(slope[1]);
    let b = parseCoef(slope[2] || '0');
    if (!isFinite(m) || !isFinite(b)) return null;
    return { a: -m, b: 1, c: b };
  }

  // ax + by = c
  let standard = str.match(/^([+-]?[\d./]*)x([+-][\d./]*)y=([+-]?[\d./]*)$/);
  if (standard) {
    let a = parseCoef(standard[1]);
    let b = parseCoef(standard[2]);
    let c = parseCoef(standard[3]);
    if (!isFinite(a) || !isFinite(b) || !isFinite(c)) return null;
    return { a, b, c };
  }
  return null;
}

function formatNumber(num) {
  return Number.isFinite(num) ? num.toFixed(2) : 'N/A';
}

function displayForms(elemId, eq) {
  const elem = document.getElementById(elemId);
  if (!eq) {
    elem.textContent = 'Invalid equation';
    return;
  }
  const m = -eq.a / eq.b;
  const b = eq.c / eq.b;
  const std = `${eq.a.toFixed(2)}x + ${eq.b.toFixed(2)}y = ${eq.c.toFixed(2)}`;
  const slope = `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`;
  elem.textContent = std + '\n' + slope;
}

function plot() {
  const eq1 = parseEquation(document.getElementById('eq1').value);
  const eq2 = parseEquation(document.getElementById('eq2').value);

  displayForms('eq1-forms', eq1);
  displayForms('eq2-forms', eq2);

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

  Plotly.newPlot('graph', traces, {
    margin: { t: 10 },
    xaxis: { zeroline: true, range: [-10, 10] },
    yaxis: { zeroline: true, range: [-10, 10], scaleanchor: 'x' }
  });

  document.getElementById('solutions').innerHTML = solHtml;
}

document.getElementById('plot-btn').addEventListener('click', plot);
