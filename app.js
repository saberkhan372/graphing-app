const line1 = { m: 2, b: 3 };
const line2 = { m: -1, b: 1 };

function lineData({ m, b }) {
  const xs = [-10, 10];
  const ys = xs.map(x => m * x + b);
  return { x: xs, y: ys };
}

// Traces for the two lines
const line1Trace = {
  ...lineData(line1),
  mode: 'lines',
  name: 'Line 1'
};

const line2Trace = {
  ...lineData(line2),
  mode: 'lines',
  name: 'Line 2'
};

// Compute intercepts and intersection
const xIntercept = -line1.b / line1.m;
const yIntercept = line1.b;
const intersectionX = (line2.b - line1.b) / (line1.m - line2.m);
const intersectionY = line1.m * intersectionX + line1.b;

// Trace for x-intercept
const xInterceptTrace = {
  x: [xIntercept],
  y: [0],
  mode: 'markers+text',
  marker: { color: 'red', size: 10 },
  text: ['x-int'],
  textposition: 'top right',
  textfont: { color: 'red', size: 12 }
};

// Trace for y-intercept
const yInterceptTrace = {
  x: [0],
  y: [yIntercept],
  mode: 'markers+text',
  marker: { color: 'blue', size: 10 },
  text: ['y-int'],
  textposition: 'top right',
  textfont: { color: 'blue', size: 12 }
};

// Trace for intersection
const intersectionTrace = {
  x: [intersectionX],
  y: [intersectionY],
  mode: 'markers+text',
  marker: { color: 'green', size: 10 },
  text: [`(${intersectionX.toFixed(2)}, ${intersectionY.toFixed(2)})`],
  textposition: 'top right',
  textfont: { color: 'green', size: 12 }
};

const data = [line1Trace, line2Trace, xInterceptTrace, yInterceptTrace, intersectionTrace];

// Plotly requires a DOM element with id 'plot'. When run in a browser,
// ensure there is a <div id="plot"></div> element.
if (typeof document !== 'undefined') {
  Plotly.newPlot('plot', data);
}
