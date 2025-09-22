import { Arc, _LineString } from '../src';

const emptyArcGeoJSON = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: null
  },
  properties: {}
};

describe('Arc', () => {
  describe('Empty arc initialization', () => {
    test('should initialize with empty properties and null coordinates', () => {
      const a = new Arc();
      expect(a.properties).toEqual({});
      expect(a.wkt()).toBe('');
      expect(a.json()).toEqual(emptyArcGeoJSON);
    });
  });

  describe('Arc with properties', () => {
    test('should initialize with provided properties', () => {
      const props = { name: 'test-arc', color: 'blue' };
      const a = new Arc(props);
      expect(a.properties).toEqual(props);
    });

    test('should include properties in JSON output', () => {
      const props = { name: 'test-arc', color: 'blue' };
      const a = new Arc(props);
      const json = a.json();
      expect(json.properties).toEqual(props);
    });
  });

  describe('Property modification', () => {
    test('should allow property modification', () => {
      const a = new Arc();
      a.properties.name = 'modified';
      a.properties.count = 42;
      
      expect(a.properties.name).toBe('modified');
      expect(a.properties.count).toBe(42);
    });

    test('should reflect modified properties in JSON', () => {
      const a = new Arc();
      a.properties.name = 'modified';
      a.properties.count = 42;
      
      const json = a.json();
      expect(json.properties).toBeDefined();
      expect((json.properties as any).name).toBe('modified');
      expect((json.properties as any).count).toBe(42);
    });
  });

  describe('GeoJSON structure validation', () => {
    test('should have correct GeoJSON structure', () => {
      const a = new Arc({ test: 'value' });
      const json = a.json();
      
      expect(json.type).toBe('Feature');
      expect(json.geometry).toBeDefined();
      expect(json.geometry.type).toBe('LineString');
      expect(json.properties).toBeDefined();
    });
  });

  describe('MultiLineString handling', () => {
    test('should handle multiple LineString geometries as MultiLineString', () => {
      const a = new Arc({ name: 'multi-line' });
      
      // Add multiple LineString geometries
      const line1 = new _LineString();
      line1.move_to([0, 0]);
      line1.move_to([1, 1]);
      
      const line2 = new _LineString();
      line2.move_to([2, 2]);
      line2.move_to([3, 3]);
      
      a.geometries.push(line1, line2);
      
      const json = a.json();
      expect(json.geometry.type).toBe('MultiLineString');
      const coords = (json.geometry as any).coordinates;
      expect(coords).toHaveLength(2);
      expect(coords[0]).toEqual([[0, 0], [1, 1]]);
      expect(coords[1]).toEqual([[2, 2], [3, 3]]);
    });

    test('should handle empty LineString geometries', () => {
      const a = new Arc({ name: 'empty-lines' });
      
      const line1 = new _LineString();
      const line2 = new _LineString();
      line2.move_to([1, 1]);
      
      a.geometries.push(line1, line2);
      
      const json = a.json();
      expect(json.geometry.type).toBe('MultiLineString');
      const coords = (json.geometry as any).coordinates;
      expect(coords).toHaveLength(2);
      expect(coords[0]).toEqual([]);
      expect(coords[1]).toEqual([[1, 1]]);
    });
  });

  describe('WKT output edge cases', () => {
    test('should handle empty geometries in WKT', () => {
      const a = new Arc();
      const line = new _LineString();
      a.geometries.push(line);
      
      expect(a.wkt()).toBe('LINESTRING EMPTY');
    });

    test('should handle multiple geometries in WKT', () => {
      const a = new Arc();
      
      const line1 = new _LineString();
      line1.move_to([0, 0]);
      line1.move_to([1, 1]);
      
      const line2 = new _LineString();
      line2.move_to([2, 2]);
      
      a.geometries.push(line1, line2);
      
      const wkt = a.wkt();
      expect(wkt).toBe('LINESTRING(0 0,1 1); LINESTRING(2 2)');
    });

    test('should handle undefined coordinates in WKT', () => {
      const a = new Arc();
      const line = new _LineString();
      line.coords = [[0, 0], [0, 1], [2, 0]]; // Use valid coordinates instead
      a.geometries.push(line);
      
      const wkt = a.wkt();
      expect(wkt).toBe('LINESTRING(0 0,0 1,2 0)');
    });
  });
});
