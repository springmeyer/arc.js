import { GreatCircle } from '@/great-circle';
import { Arc } from '@/arc';

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
  });
});
