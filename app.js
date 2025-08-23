function parseEquation(str) {
  if (!str) return null;
  str = str.replace(/\s+/g, '').toLowerCase();

  // y = mx + b
  let slope = str.match(/^y=([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)?$/);
  if (slope) {
    let mStr = slope[1];
    let bStr = slope[2] || '0';
    if (mStr === '' || mStr === '+') mStr = '1';
    if (mStr === '-') mStr = '-1';
    let m = parseFloat(mStr);
    let b = parseFloat(bStr.replace('+', ''));
    return { a: -m, b: 1, c: b };
  }

  // ax + by = c
  let standard = str.match(/^([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)y=([+-]?\d*\.?\d*)$/);
  if (standard) {
    let aStr = standard[1];
    let bStr = standard[2];
    let cStr = standard[3];
    if (aStr === '' || aStr === '+') aStr = '1';
    if (aStr === '-') aStr = '-1';
    if (bStr === '' || bStr === '+') bStr = '1';
    if (bStr === '-') bStr = '-1';
    let a = parseFloat(aStr);
    let b = parseFloat(bStr.replace('+', ''));
    let c = parseFloat(cStr);
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
