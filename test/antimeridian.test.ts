import { GreatCircle } from '../src';
import type { MultiLineString, LineString } from 'geojson';
import { SPLIT_NPOINTS, EAST_TO_WEST, WEST_TO_EAST, SOUTH_TO_SOUTH_E_TO_W, SOUTH_TO_SOUTH_W_TO_E, HIGH_LATITUDE, NON_CROSSING } from './fixtures/routes.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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

describe('antimeridian splitting — npoints edge cases', () => {
  // npoints=3 is the smallest value that triggers the bisection path.
  // Reuses EAST_TO_WEST — direction symmetry means one direction is sufficient here.
  describe('npoints=3 still splits correctly', () => {
    for (const { name, start, end } of EAST_TO_WEST) {
      test(`${name}`, () => {
        const result = new GreatCircle(start, end).Arc(3).json();
        expect(result.geometry.type).toBe('MultiLineString');
        assertSplitAtAntimeridian((result.geometry as MultiLineString).coordinates, true);
      });
    }
  });

  describe('npoints=2 returns LineString (intentional limitation)', () => {
    // With only 2 points (start + end), the bisection path is skipped.
    // Renderers that understand coordinate wrapping (e.g. MapLibre GL JS) handle
    // [[139.78, 35.55], [-118.41, 33.94]] correctly as a Pacific arc. Splitting
    // into two disconnected stubs with no curvature would be worse. See Arc() comment.
    for (const { name, start, end } of EAST_TO_WEST) {
      test(`${name}`, () => {
        const result = new GreatCircle(start, end).Arc(2).json();
        expect(result.geometry.type).toBe('LineString');
      });
    }
  });
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
  for (const { name, start, end, maxJump } of NON_CROSSING) {
    test(`${name} returns a LineString with no large longitude jumps`, () => {
      const result = new GreatCircle(start, end).Arc(100).json();
      expect(result.geometry.type).toBe('LineString');

      const coords = (result.geometry as LineString).coordinates;
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        if (!prev || !curr) continue;
        expect(Math.abs((curr[0] ?? 0) - (prev[0] ?? 0))).toBeLessThan(maxJump);
      }
    });
  }
});
