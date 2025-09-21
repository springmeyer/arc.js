import { Arc } from '@/arc';

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
});
