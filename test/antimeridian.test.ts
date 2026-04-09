import { GreatCircle } from '../src';
import type { MultiLineString, LineString } from 'geojson';

// npoints values exercised for antimeridian-crossing routes.
// 10 → large step size (~50°), the low-npoints regression from issue #75
// 100 → fine-grained, original failure mode from PR #55 / turf#3030
const SPLIT_NPOINTS = [10, 100] as const;

// East-to-west Pacific crossings (positive → negative longitude)
const EAST_TO_WEST = [
  { name: 'Tokyo → LAX',    start: { x: 139.7798, y: 35.5494 }, end: { x: -118.4085, y: 33.9416 } },
  { name: 'Auckland → LAX', start: { x: 174.79,   y: -36.85  }, end: { x: -118.41,   y: 33.94   } },
  { name: 'Shanghai → SFO', start: { x: 121.81,   y: 31.14   }, end: { x: -122.38,   y: 37.62   } },
];

// West-to-east Pacific crossings (negative → positive longitude)
const WEST_TO_EAST = [
  { name: 'LAX → Tokyo',    start: { x: -118.4085, y: 33.9416 }, end: { x: 139.7798, y: 35.5494 } },
  { name: 'LAX → Auckland', start: { x: -118.41,   y: 33.94   }, end: { x: 174.79,   y: -36.85  } },
  { name: 'SFO → Shanghai', start: { x: -122.38,   y: 37.62   }, end: { x: 121.81,   y: 31.14   } },
];

// South-to-south Pacific crossings (both endpoints in southern hemisphere)
const SOUTH_TO_SOUTH_E_TO_W = [
  { name: 'Sydney → Buenos Aires', start: { x: 151.21, y: -33.87 }, end: { x: -58.38, y: -34.60 } },
];

const SOUTH_TO_SOUTH_W_TO_E = [
  { name: 'Buenos Aires → Sydney', start: { x: -58.38, y: -34.60 }, end: { x: 151.21, y: -33.87 } },
];

// High-latitude routes that approach the poles
const HIGH_LATITUDE = [
  { name: 'Oslo → Anchorage',   start: { x: 10.74,  y: 59.91 }, end: { x: -149.9, y: 61.22 } },
  { name: 'London → Seattle',   start: { x: -0.12,  y: 51.51 }, end: { x: -122.33, y: 47.61 } },
];

function assertSplitAtAntimeridian(coords: number[][][], fromEast: boolean) {
  // Exactly 2 segments — guards against false positives from 3+ segment splits
  expect(coords.length).toBe(2);

  const seg0 = coords[0];
  const seg1 = coords[1];

  expect(seg0).toBeDefined();
  expect(seg1).toBeDefined();
  if (!seg0 || !seg1) return;

  const lastOfFirst = seg0[seg0.length - 1];
  const firstOfSecond = seg1[0];

  expect(lastOfFirst).toBeDefined();
  expect(firstOfSecond).toBeDefined();
  if (!lastOfFirst || !firstOfSecond) return;

  // Segment 1 must end at the correct side of the antimeridian
  expect(lastOfFirst[0] ?? NaN).toBeCloseTo(fromEast ? 180 : -180, 1);
  expect(firstOfSecond[0] ?? NaN).toBeCloseTo(fromEast ? -180 : 180, 1);

  // Latitudes must match — no gap
  expect(lastOfFirst[1] ?? NaN).toBeCloseTo(firstOfSecond[1] ?? NaN, 3);
}

describe('antimeridian splitting — east to west', () => {
  for (const npoints of SPLIT_NPOINTS) {
    describe(`npoints=${npoints}`, () => {
      for (const { name, start, end } of EAST_TO_WEST) {
        test(`${name} splits at antimeridian`, () => {
          const result = new GreatCircle(start, end).Arc(npoints).json();
          expect(result.geometry.type).toBe('MultiLineString');
          assertSplitAtAntimeridian((result.geometry as MultiLineString).coordinates, true);
        });
      }
    });
  }
});

describe('antimeridian splitting — west to east', () => {
  for (const npoints of SPLIT_NPOINTS) {
    describe(`npoints=${npoints}`, () => {
      for (const { name, start, end } of WEST_TO_EAST) {
        test(`${name} splits at antimeridian`, () => {
          const result = new GreatCircle(start, end).Arc(npoints).json();
          expect(result.geometry.type).toBe('MultiLineString');
          assertSplitAtAntimeridian((result.geometry as MultiLineString).coordinates, false);
        });
      }
    });
  }
});

describe('antimeridian splitting — south to south, east to west', () => {
  for (const npoints of SPLIT_NPOINTS) {
    describe(`npoints=${npoints}`, () => {
      for (const { name, start, end } of SOUTH_TO_SOUTH_E_TO_W) {
        test(`${name} splits at antimeridian`, () => {
          const result = new GreatCircle(start, end).Arc(npoints).json();
          expect(result.geometry.type).toBe('MultiLineString');
          assertSplitAtAntimeridian((result.geometry as MultiLineString).coordinates, true);
        });
      }
    });
  }
});

describe('antimeridian splitting — south to south, west to east', () => {
  for (const npoints of SPLIT_NPOINTS) {
    describe(`npoints=${npoints}`, () => {
      for (const { name, start, end } of SOUTH_TO_SOUTH_W_TO_E) {
        test(`${name} splits at antimeridian`, () => {
          const result = new GreatCircle(start, end).Arc(npoints).json();
          expect(result.geometry.type).toBe('MultiLineString');
          assertSplitAtAntimeridian((result.geometry as MultiLineString).coordinates, false);
        });
      }
    });
  }
});

describe('high-latitude routes', () => {
  for (const { name, start, end } of HIGH_LATITUDE) {
    test(`${name} produces valid GeoJSON with no large longitude jumps`, () => {
      const result = new GreatCircle(start, end).Arc(100).json();
      expect(['LineString', 'MultiLineString']).toContain(result.geometry.type);

      const allCoords: number[][] = result.geometry.type === 'MultiLineString'
        ? (result.geometry as MultiLineString).coordinates.flat()
        : (result.geometry as LineString).coordinates;

      for (let i = 1; i < allCoords.length; i++) {
        const prev = allCoords[i - 1];
        const curr = allCoords[i];
        if (!prev || !curr) continue;
        expect(Math.abs((curr[0] ?? 0) - (prev[0] ?? 0))).toBeLessThan(180);
      }
    });
  }
});

describe('non-crossing routes are unaffected', () => {
  test('Seattle → DC returns a LineString with no longitude jumps', () => {
    const result = new GreatCircle({ x: -122, y: 48 }, { x: -77, y: 39 }).Arc(100).json();
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
