/**
 * Benchmarks antimeridian bisection (current) vs linear interpolation (old GDAL heuristic).
 *
 * The old approach linearly interpolated the crossing latitude from the two already-computed
 * adjacent sample points — zero additional interpolate() calls.
 *
 * The new approach runs 50 bisection iterations (2 interpolate() calls each = 100 calls)
 * per antimeridian crossing to find the exact latitude.
 *
 * Usage:
 *   node scripts/benchmark.mjs
 *
 * Requires a built dist/: run `npm run build` first.
 */

import { GreatCircle } from '../dist/index.js';

// ---------------------------------------------------------------------------
// Routes: one non-crossing (control) and three antimeridian crossings.
// All taken from test/fixtures/routes.ts.
// ---------------------------------------------------------------------------

const ROUTES = {
  'Seattle → DC (non-crossing)':  { start: { x: -122, y: 48 },       end: { x: -77, y: 39 } },
  'Tokyo → LAX (1 crossing)':     { start: { x: 139.7798, y: 35.5494 }, end: { x: -118.4085, y: 33.9416 } },
  'Auckland → LAX (1 crossing)':  { start: { x: 174.79, y: -36.85 },  end: { x: -118.41, y: 33.94 } },
  'Shanghai → SFO (1 crossing)':  { start: { x: 121.81, y: 31.14 },   end: { x: -122.38, y: 37.62 } },
};

const NPOINTS_VALUES = [10, 100, 1000];
const REPS = 2000; // repetitions per (route × npoints) cell

// ---------------------------------------------------------------------------
// Baseline: linear interpolation (mirrors the old GDAL heuristic approach).
// When |Δlon| > 180, linearly interpolate the crossing latitude from the two
// adjacent already-computed sample points — no additional interpolate() calls.
// ---------------------------------------------------------------------------

function arcLinear(gc, npoints) {
  if (!npoints || npoints <= 2) return;

  const delta = 1.0 / (npoints - 1);
  const points = [];
  for (let i = 0; i < npoints; i++) {
    points.push(gc.interpolate(delta * i));
  }

  const segments = [];
  let current = [];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (i === 0) { current.push(pt); continue; }

    const prev = points[i - 1];
    if (Math.abs(pt[0] - prev[0]) > 180) {
      // Linear interpolation: estimate crossing lat from adjacent sampled points.
      // t is how far along [prev→pt] the ±180 boundary lies, using lon values.
      const t = (prev[0] > 0 ? 180 - prev[0] : -180 - prev[0]) / (pt[0] - prev[0]);
      const crossingLat = prev[1] + t * (pt[1] - prev[1]);
      const fromEast = prev[0] > 0;
      current.push([fromEast ? 180 : -180, crossingLat]);
      segments.push(current);
      current = [[fromEast ? -180 : 180, crossingLat]];
    }

    current.push(pt);
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

// ---------------------------------------------------------------------------
// Benchmark runner
// ---------------------------------------------------------------------------

function bench(label, fn, reps) {
  // Warm up V8 JIT
  for (let i = 0; i < 50; i++) fn();

  const t0 = performance.now();
  for (let i = 0; i < reps; i++) fn();
  const elapsed = performance.now() - t0;

  return { label, reps, totalMs: elapsed, usPerArc: (elapsed / reps) * 1000 };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log(`Benchmark: bisection vs linear interpolation`);
console.log(`${REPS} reps per cell\n`);

const header = ['Route', 'npoints', 'Method', 'µs/arc', 'overhead'];
console.log(header.join('\t'));
console.log(header.map(h => '-'.repeat(h.length)).join('\t'));

for (const [routeName, { start, end }] of Object.entries(ROUTES)) {
  const gc = new GreatCircle(start, end);

  for (const npoints of NPOINTS_VALUES) {
    const bisection = bench(
      `bisection   n=${npoints}`,
      () => gc.Arc(npoints),
      REPS
    );

    const linear = bench(
      `linear-interp n=${npoints}`,
      () => arcLinear(gc, npoints),
      REPS
    );

    const overhead = ((bisection.usPerArc - linear.usPerArc) / linear.usPerArc * 100).toFixed(1);
    const overheadStr = overhead > 0 ? `+${overhead}%` : `${overhead}%`;

    console.log([
      routeName,
      npoints,
      'bisection',
      bisection.usPerArc.toFixed(2),
      overheadStr,
    ].join('\t'));
    console.log([
      '',
      '',
      'linear (baseline)',
      linear.usPerArc.toFixed(2),
      '',
    ].join('\t'));
  }
  console.log();
}
