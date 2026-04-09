import { Arc, GreatCircle } from '../src';

// Common test coordinates
const startPoint = { x: 0, y: 0 };
const endPoint = { x: 10, y: 0 };
const seattleCoords = { x: -122, y: 48 };
const dcCoords = { x: -77, y: 39 };

// Common test properties
const testRouteProps = { name: 'Test Route', color: 'red' };

// Antipodal test coordinates (should throw error)
const antipodal1 = { x: 1, y: 1 };
const antipodal2 = { x: -179, y: -1 };

const expectedAntipodalError = "it appears 1,1 and -179,-1 are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite";

describe('GreatCircle', () => {
  describe('Basic construction and interpolation', () => {
    test('should create GreatCircle and interpolate a start and end point', () => {
      const gc = new GreatCircle(startPoint, endPoint);
      
      expect(gc).toBeDefined();
      expect(gc.interpolate(0)).toEqual([0, 0]);
      expect(gc.interpolate(1)).toEqual([10, 0]);
    });
  });

  describe('Constructor with properties', () => {
    test('should set properties correctly', () => {
      // Clone props to avoid test pollution
      const props = { ...testRouteProps };
      const gc = new GreatCircle(seattleCoords, dcCoords, props);
      
      expect(gc.properties).toEqual(props);
    });
  });

  describe('Interpolation at midpoint', () => {
    test('should calculate midpoint correctly', () => {
      const gc = new GreatCircle(seattleCoords, dcCoords);
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
      const gc = new GreatCircle(seattleCoords, dcCoords);
      const generatedArc = gc.Arc(3);
      
      expect(generatedArc).toBeInstanceOf(Arc);
    });

    test('should generate geometries', () => {
      const gc = new GreatCircle(seattleCoords, dcCoords);
      const generatedArc = gc.Arc(3);
      
      expect(generatedArc.geometries.length).toBeGreaterThan(0);
    });

    test('should produce valid GeoJSON Feature with coordinates', () => {
      const gc = new GreatCircle(seattleCoords, dcCoords);
      const generatedArc = gc.Arc(3);
      
      const json = generatedArc.json();
      expect(json.type).toBe('Feature');
      expect(json.geometry).toBeDefined();
      
      // Check that coordinates exist and have length
      expect('coordinates' in json.geometry).toBe(true);
      const coords = (json.geometry as any).coordinates;
      expect(Array.isArray(coords)).toBe(true);
      expect(coords.length).toBeGreaterThan(0);
    });
  });

  describe('GreatCircleException: Antipodal points', () => {
    test('should throw error for antipodal points', () => {
      expect(() => {
        new GreatCircle(antipodal1, antipodal2);
      }).toThrow(expectedAntipodalError);
    });
  });

  describe('Input validation', () => {
    test('should validate start point', () => {
      expect(() => {
        new GreatCircle(null as any, endPoint);
      }).toThrow(/expects two args/);
    });

    test('should validate end point', () => {
      expect(() => {
        new GreatCircle(startPoint, null as any);
      }).toThrow(/expects two args/);
    });

    test('should validate start point with undefined x', () => {
      expect(() => {
        new GreatCircle({ x: undefined, y: 0 } as any, endPoint);
      }).toThrow(/expects two args/);
    });

    test('should validate end point with undefined y', () => {
      expect(() => {
        new GreatCircle(startPoint, { x: 0, y: undefined } as any);
      }).toThrow(/expects two args/);
    });
  });

  describe('Arc generation edge cases', () => {
    test('should handle npoints <= 2', () => {
      const gc = new GreatCircle(seattleCoords, dcCoords);
      const arc = gc.Arc(2);
      
      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(2);
    });

    test('should handle npoints = 0', () => {
      const gc = new GreatCircle(seattleCoords, dcCoords);
      const arc = gc.Arc(0);
      
      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(2);
    });

    test('should handle npoints = 1', () => {
      const gc = new GreatCircle(seattleCoords, dcCoords);
      const arc = gc.Arc(1);
      
      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(2);
    });

    test('should handle undefined npoints', () => {
      const gc = new GreatCircle(seattleCoords, dcCoords);
      const arc = gc.Arc(undefined as any);
      
      expect(arc.geometries).toHaveLength(1);
      expect(arc.geometries[0]?.coords).toHaveLength(2);
    });
  });

  describe('Dateline crossing', () => {
    test('should handle routes that cross the dateline', () => {
      // Route from Pacific to Asia that crosses dateline
      const pacific = { x: 170, y: 0 };
      const asia = { x: -170, y: 0 };
      
      const gc = new GreatCircle(pacific, asia);
      const arc = gc.Arc(10);
      
      expect(arc.geometries.length).toBeGreaterThan(0);
      
      // Should potentially create multiple LineStrings for dateline crossing
      const json = arc.json();
      expect(json.type).toBe('Feature');
    });

    test('should handle routes near dateline', () => {
      const nearDateline1 = { x: 175, y: 0 };
      const nearDateline2 = { x: -175, y: 0 };

      const gc = new GreatCircle(nearDateline1, nearDateline2);
      const arc = gc.Arc(5);
      
      expect(arc.geometries.length).toBeGreaterThan(0);
    });

    test('should split Tokyo-LAX route at antimeridian with shared crossing point', () => {
      const tokyo = { x: 139.7798, y: 35.5494 };
      const lax = { x: -118.4085, y: 33.9416 };
      
      const gc = new GreatCircle(tokyo, lax);
      const json = gc.Arc(100).json();
      
      expect(json.geometry.type).toBe('MultiLineString');
      const coords = (json.geometry as any).coordinates;
      expect(coords.length).toBe(2);
      
      // Last point of first segment should be on +180
      const lastOfFirst = coords[0][coords[0].length - 1];
      expect(lastOfFirst[0]).toBe(180);
      
      // First point of second segment should be on -180
      const firstOfSecond = coords[1][0];
      expect(firstOfSecond[0]).toBe(-180);
      
      // Both crossing points share the same interpolated latitude
      expect(lastOfFirst[1]).toBe(firstOfSecond[1]);
    });

    test('should split Auckland-LA route at antimeridian with shared crossing point', () => {
      const auckland = { x: 174.79, y: -36.85 };
      const la = { x: -118.41, y: 33.94 };
      
      const gc = new GreatCircle(auckland, la);
      const json = gc.Arc(100).json();
      
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
      const shanghai = { x: 121.81, y: 31.14 };
      const sfo = { x: -122.38, y: 37.62 };
      
      const gc = new GreatCircle(shanghai, sfo);
      const json = gc.Arc(100).json();
      
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
      const tokyo = { x: 139.7798, y: 35.5494 };
      const lax = { x: -118.4085, y: 33.9416 };
      
      const gc = new GreatCircle(tokyo, lax);
      const json = gc.Arc(100).json();
      const coords = (json.geometry as any).coordinates;
      
      for (const segment of coords) {
        for (let i = 1; i < segment.length; i++) {
          const lonDiff = Math.abs(segment[i][0] - segment[i - 1][0]);
          // No segment should have an internal jump > 180 degrees
          expect(lonDiff).toBeLessThan(180);
        }
      }
    });
  });

  describe('Error handling', () => {
    test('should handle NaN calculation errors', () => {
      // This might trigger NaN in the calculation
      expect(() => {
        new GreatCircle({ x: NaN, y: 0 }, endPoint);
      }).toThrow();
    });
  });
});
