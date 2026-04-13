import { Arc, GreatCircle } from '../src';
import { ORIGIN, TEN_EAST, SEATTLE, DC, ANTIPODAL, makeProps, EAST_TO_WEST } from './fixtures/routes.js';

describe('GreatCircle', () => {
  describe('Basic construction and interpolation', () => {
    test('should create GreatCircle and interpolate a start and end point', () => {
      const gc = new GreatCircle(ORIGIN, TEN_EAST);

      expect(gc).toBeDefined();
      expect(gc.interpolate(0)).toEqual([0, 0]);
      expect(gc.interpolate(1)).toEqual([10, 0]);
    });
  });

  describe('Constructor with properties', () => {
    test('should set properties correctly', () => {
      const props = makeProps();
      const gc = new GreatCircle(SEATTLE, DC, props);

      expect(gc.properties).toEqual(props);
    });
  });

  describe('Interpolation at midpoint', () => {
    test('should calculate midpoint correctly', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const midpoint = gc.interpolate(0.5);

      expect(midpoint).toHaveLength(2);
      expect(typeof midpoint[0]).toBe('number');
      expect(typeof midpoint[1]).toBe('number');

      // Midpoint should be between start and end
      expect(midpoint[0]).toBeGreaterThan(-122);
      expect(midpoint[0]).toBeLessThan(-77);
      expect(midpoint[1]).toBeGreaterThan(39);
      expect(midpoint[1]).toBeLessThan(48);
    });
  });

  describe('Arc generation', () => {
    test('should return Arc instance', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const generatedArc = gc.Arc(3);

      expect(generatedArc).toBeInstanceOf(Arc);
    });

    test('should generate geometries', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const generatedArc = gc.Arc(3);

      expect(generatedArc.geometries.length).toBeGreaterThan(0);
    });

    test('should produce valid GeoJSON Feature with coordinates', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const generatedArc = gc.Arc(3);

      const json = generatedArc.json();
      expect(json.type).toBe('Feature');
      expect(json.geometry).toBeDefined();

      expect('coordinates' in json.geometry).toBe(true);
      const coords = (json.geometry as any).coordinates;
      expect(Array.isArray(coords)).toBe(true);
      expect(coords.length).toBeGreaterThan(0);
    });
  });

  describe('GreatCircleException: Antipodal points', () => {
    test('should throw error for antipodal points', () => {
      expect(() => {
        new GreatCircle(ANTIPODAL.start, ANTIPODAL.end);
      }).toThrow(ANTIPODAL.expectedError);
    });
  });

  describe('Input validation', () => {
    test('should validate start point', () => {
      expect(() => {
        new GreatCircle(null as any, TEN_EAST);
      }).toThrow(/expects two args/);
    });

    test('should validate end point', () => {
      expect(() => {
        new GreatCircle(ORIGIN, null as any);
      }).toThrow(/expects two args/);
    });

    test('should validate start point with undefined x', () => {
      expect(() => {
        new GreatCircle({ x: undefined, y: 0 } as any, TEN_EAST);
      }).toThrow(/expects two args/);
    });

    test('should validate end point with undefined y', () => {
      expect(() => {
        new GreatCircle(ORIGIN, { x: 0, y: undefined } as any);
      }).toThrow(/expects two args/);
    });
  });

  describe('Arc generation edge cases', () => {
    test('should handle npoints <= 2', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const arc = gc.Arc(2);

      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(2);
    });

    test('should handle npoints = 0', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const arc = gc.Arc(0);

      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(2);
    });

    test('should handle npoints = 1', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const arc = gc.Arc(1);

      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(2);
    });

    test('should default to 100 points when npoints is undefined', () => {
      const gc = new GreatCircle(SEATTLE, DC);
      const arc = gc.Arc(undefined as any);

      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(100);
    });
  });

  describe('Dateline crossing', () => {
    test('should handle routes that cross the dateline', () => {
      // Generic equatorial crossing — not a named fixture (synthetic boundary test)
      const gc = new GreatCircle({ x: 170, y: 0 }, { x: -170, y: 0 });
      const arc = gc.Arc(10);

      expect(arc.geometries.length).toBeGreaterThan(0);
      expect(arc.json().type).toBe('Feature');
    });

    test('should handle routes near dateline', () => {
      const gc = new GreatCircle({ x: 175, y: 0 }, { x: -175, y: 0 });
      const arc = gc.Arc(5);

      expect(arc.geometries.length).toBeGreaterThan(0);
    });

    test('should split Tokyo-LAX route at antimeridian with shared crossing point', () => {
      const { start: tokyo, end: lax } = EAST_TO_WEST[0]!;
      const json = new GreatCircle(tokyo, lax).Arc(100).json();

      expect(json.geometry.type).toBe('MultiLineString');
      const coords = (json.geometry as any).coordinates;
      expect(coords.length).toBe(2);

      const lastOfFirst = coords[0][coords[0].length - 1];
      const firstOfSecond = coords[1][0];
      expect(lastOfFirst[0]).toBe(180);
      expect(firstOfSecond[0]).toBe(-180);
      expect(lastOfFirst[1]).toBe(firstOfSecond[1]);
    });

    test('should split Auckland-LA route at antimeridian with shared crossing point', () => {
      const { start: auckland, end: la } = EAST_TO_WEST[1]!;
      const json = new GreatCircle(auckland, la).Arc(100).json();

      expect(json.geometry.type).toBe('MultiLineString');
      const coords = (json.geometry as any).coordinates;
      expect(coords.length).toBe(2);

      const lastOfFirst = coords[0][coords[0].length - 1];
      const firstOfSecond = coords[1][0];
      expect(lastOfFirst[0]).toBe(180);
      expect(firstOfSecond[0]).toBe(-180);
      expect(lastOfFirst[1]).toBe(firstOfSecond[1]);
    });

    test('should split Shanghai-SFO route at antimeridian with shared crossing point', () => {
      const { start: shanghai, end: sfo } = EAST_TO_WEST[2]!;
      const json = new GreatCircle(shanghai, sfo).Arc(100).json();

      expect(json.geometry.type).toBe('MultiLineString');
      const coords = (json.geometry as any).coordinates;
      expect(coords.length).toBe(2);

      const lastOfFirst = coords[0][coords[0].length - 1];
      const firstOfSecond = coords[1][0];
      expect(lastOfFirst[0]).toBe(180);
      expect(firstOfSecond[0]).toBe(-180);
      expect(lastOfFirst[1]).toBe(firstOfSecond[1]);
    });

    test('should not have large longitude jumps within any segment', () => {
      const { start: tokyo, end: lax } = EAST_TO_WEST[0]!;
      const coords = (new GreatCircle(tokyo, lax).Arc(100).json().geometry as any).coordinates;

      for (const segment of coords) {
        for (let i = 1; i < segment.length; i++) {
          expect(Math.abs(segment[i][0] - segment[i - 1][0])).toBeLessThan(180);
        }
      }
    });
  });

  describe('Error handling', () => {
    test('should handle NaN calculation errors', () => {
      expect(() => {
        new GreatCircle({ x: NaN, y: 0 }, TEN_EAST);
      }).toThrow();
    });
  });
});
