/**
 * Dumps all test route fixtures as a GeoJSON FeatureCollection for visual
 * verification. Paste the output into https://geojson.io to inspect routes.
 *
 * Usage:
 *   node scripts/dump-fixtures.mjs > fixtures.geojson
 *   node scripts/dump-fixtures.mjs | pbcopy   # macOS: copy to clipboard
 *
 * Requires a built dist/ (run `npm run build` first).
 * Route coordinates are duplicated from test/fixtures/routes.ts — plain JS
 * cannot import TypeScript directly, so they are kept in sync manually.
 */

import { GreatCircle } from '../dist/index.js';

// ---------------------------------------------------------------------------
// Route data — mirrors test/fixtures/routes.ts (kept in plain JS so no build
// step is needed beyond the library itself).
// ---------------------------------------------------------------------------

const EAST_TO_WEST = [
  { name: 'Tokyo → LAX',    start: [139.7798, 35.5494], end: [-118.4085, 33.9416] },
  { name: 'Auckland → LAX', start: [174.79,   -36.85 ], end: [-118.41,   33.94  ] },
  { name: 'Shanghai → SFO', start: [121.81,    31.14 ], end: [-122.38,   37.62  ] },
];

const WEST_TO_EAST = [
  { name: 'LAX → Tokyo',    start: [-118.4085, 33.9416], end: [139.7798,  35.5494] },
  { name: 'LAX → Auckland', start: [-118.41,   33.94  ], end: [174.79,   -36.85 ] },
  { name: 'SFO → Shanghai', start: [-122.38,   37.62  ], end: [121.81,    31.14 ] },
];

const SOUTH_TO_SOUTH = [
  { name: 'Sydney → Buenos Aires', start: [151.21,  -33.87], end: [-58.38, -34.60] },
  { name: 'Buenos Aires → Sydney', start: [-58.38, -34.60], end: [151.21,  -33.87] },
];

const HIGH_LATITUDE = [
  { name: 'Oslo → Anchorage', start: [ 10.74, 59.91], end: [-149.9,  61.22] },
  { name: 'London → Seattle', start: [ -0.12, 51.51], end: [-122.33, 47.61] },
];

const NON_CROSSING = [
  { name: 'Seattle → DC',    start: [-122.0,  48.0 ], end: [-77.0,  39.0 ] },
  { name: 'NYC → London',    start: [ -74.0,  40.71], end: [  -0.13, 51.51] },
  { name: 'NYC → Paris',     start: [ -74.0,  40.71], end: [   2.35, 48.85] },
  { name: 'Lagos → Colombo', start: [   3.4,   6.5 ], end: [  79.9,   6.9 ] },
];

const INTEGRATION = [
  { name: 'Seattle → DC',                               start: [ -122,             48                  ], end: [  -77,             39                   ] },
  { name: 'Seattle → London',                           start: [ -122,             48                  ], end: [    0,             51                   ] },
  { name: 'Pamlico Sound → Tasmania',                   start: [  -75.9375,        35.460669951495305  ], end: [  146.25,        -43.06888777416961      ] },
  { name: 'Sea of Okhotsk → Southern Pacific',          start: [  145.546875,      48.45835188280866   ], end: [ -112.5,         -37.71859032558814      ] },
  { name: 'Colombia/Peru border → Northern Territory',  start: [  -74.564208984375, -0.17578097424708533], end: [  137.779541015625, -22.75592068148639  ] },
  { name: 'Challapata, Bolivia → Western Australia',    start: [  -66.829833984375,-18.81271785640776  ], end: [  118.795166015625, -20.797201434306984  ] },
];

// Group labels for styling in geojson.io
const GROUPS = [
  { routes: EAST_TO_WEST,   group: 'crossing-E→W' },
  { routes: WEST_TO_EAST,   group: 'crossing-W→E' },
  { routes: SOUTH_TO_SOUTH, group: 'crossing-south-south' },
  { routes: HIGH_LATITUDE,  group: 'high-latitude' },
  { routes: NON_CROSSING,   group: 'non-crossing' },
  { routes: INTEGRATION,    group: 'integration' },
];

// ---------------------------------------------------------------------------
// Generate features using the library — arcs reflect actual great circle paths
// ---------------------------------------------------------------------------

const NPOINTS = 100; // resolution; higher = smoother curves

const features = [];

for (const { routes, group } of GROUPS) {
  for (const { name, start, end } of routes) {
    const gc = new GreatCircle({ x: start[0], y: start[1] }, { x: end[0], y: end[1] }, { name });
    const geojson = gc.Arc(NPOINTS).json();

    // Arc geometry (actual great circle path produced by the library)
    features.push({
      type: 'Feature',
      properties: { name, group },
      geometry: geojson.geometry,
    });

    // Point markers for start and end
    features.push({
      type: 'Feature',
      properties: { name: `${name} (start)`, group, role: 'start' },
      geometry: { type: 'Point', coordinates: start },
    });
    features.push({
      type: 'Feature',
      properties: { name: `${name} (end)`, group, role: 'end' },
      geometry: { type: 'Point', coordinates: end },
    });
  }
}

console.log(JSON.stringify({ type: 'FeatureCollection', features }, null, 2));
