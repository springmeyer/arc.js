import { GreatCircle } from '../src';
import type { MultiLineString, LineString } from 'geojson';

// Routes that cross the antimeridian
const PACIFIC_ROUTES = [
  { name: 'Tokyo → LAX',    start: { x: 139.7798, y: 35.5494 }, end: { x: -118.4085, y: 33.9416 } },
  { name: 'Auckland → LAX', start: { x: 174.79,   y: -36.85  }, end: { x: -118.41,   y: 33.94   } },
  { name: 'Shanghai → SFO', start: { x: 121.81,   y: 31.14   }, end: { x: -122.38,   y: 37.62   } },
];

function assertSplitAtAntimeridian(coords: number[][][]) {
  const seg0 = coords[0];
  const seg1 = coords[1];

  expect(seg0).toBeDefined();
  expect(seg1).toBeDefined();

  if (!seg0 || !seg1) return; // narrow for TS

  const lastOfFirst = seg0[seg0.length - 1];
  const firstOfSecond = seg1[0];

  expect(lastOfFirst).toBeDefined();
  expect(firstOfSecond).toBeDefined();

  if (!lastOfFirst || !firstOfSecond) return; // narrow for TS

  // Both sides of the split must be at ±180
  expect(Math.abs(lastOfFirst[0] ?? NaN)).toBeCloseTo(180, 1);
  expect(Math.abs(firstOfSecond[0] ?? NaN)).toBeCloseTo(180, 1);

  // Latitudes must match — no gap at the antimeridian
  expect(lastOfFirst[1] ?? NaN).toBeCloseTo(firstOfSecond[1] ?? NaN, 3);
}

describe('antimeridian splitting', () => {
  describe('with npoints=100', () => {
    for (const { name, start, end } of PACIFIC_ROUTES) {
      test(`${name} produces a split MultiLineString`, () => {
        const result = new GreatCircle(start, end).Arc(100, { offset: 10 }).json();
        expect(result.geometry.type).toBe('MultiLineString');
        assertSplitAtAntimeridian((result.geometry as MultiLineString).coordinates);
      });
    }
  });

  describe('with npoints=10', () => {
    for (const { name, start, end } of PACIFIC_ROUTES) {
      test(`${name} splits correctly`, () => {
        const result = new GreatCircle(start, end).Arc(10, { offset: 10 }).json();
        expect(result.geometry.type).toBe('MultiLineString');
        assertSplitAtAntimeridian((result.geometry as MultiLineString).coordinates);
      });
    }
  });

  describe('non-crossing routes are unaffected', () => {
    test('Seattle → DC returns a LineString with no longitude jumps', () => {
      const result = new GreatCircle({ x: -122, y: 48 }, { x: -77, y: 39 }).Arc(100, { offset: 10 }).json();
      expect(result.geometry.type).toBe('LineString');

      const coords = (result.geometry as LineString).coordinates;
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        if (!prev || !curr) continue;
        expect(Math.abs((curr[0] ?? 0) - (prev[0] ?? 0))).toBeLessThan(20);
      }
    });
  });
});
