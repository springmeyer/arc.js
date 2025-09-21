import { GreatCircle } from '@/great-circle';
import type { CoordinatePoint } from '@/types';

// Complex real-world routes for integration testing
interface TestRoute {
  start: CoordinatePoint;
  end: CoordinatePoint;
  properties: { name: string };
}

const routes: TestRoute[] = [
  {
    start: { x: -122, y: 48 },
    end: { x: -77, y: 39 },
    properties: { name: 'Seattle to DC' }
  },
  {
    start: { x: -122, y: 48 },
    end: { x: 0, y: 51 },
    properties: { name: 'Seattle to London' }
  },
  {
    start: { x: -75.9375, y: 35.460669951495305 },
    end: { x: 146.25, y: -43.06888777416961 },
    properties: { name: 'crosses dateline 1' }
  },
  {
    start: { x: 145.54687500000003, y: 48.45835188280866 },
    end: { x: -112.5, y: -37.71859032558814 },
    properties: { name: 'crosses dateline 2' }
  },
  {
    start: { x: -74.564208984375, y: -0.17578097424708533 },
    end: { x: 137.779541015625, y: -22.75592068148639 },
    properties: { name: 'south 1' }
  },
  {
    start: { x: -66.829833984375, y: -18.81271785640776 },
    end: { x: 118.795166015625, y: -20.797201434306984 },
    properties: { name: 'south 2' }
  }
];

const expectedArcs = [
  {
    "properties": { "name": "Seattle to DC" },
    "geometries": [{
      "coords": [
        [-122, 48],
        [-97.728086, 45.753682],
        [-77, 39]
      ],
      "length": 3
    }]
  },
  {
    "properties": { "name": "Seattle to London" },
    "geometries": [{
      "coords": [
        [-122, 48],
        [-64.165901, 67.476242],
        [0, 51]
      ],
      "length": 3
    }]
  },
  {
    "properties": { "name": "crosses dateline 1" },
    "geometries": [{
      "coords": [
        [-75.9375, 35.46067],
        [-136.823034, -10.367409],
        [146.25, -43.068888]
      ],
      "length": 3
    }]
  },
  {
    "properties": { "name": "crosses dateline 2" },
    "geometries": [{
      "coords": [
        [145.546875, 48.458352],
        [-157.284841, 8.442054],
        [-112.5, -37.71859]
      ],
      "length": 3
    }]
  },
  {
    "properties": { "name": "south 1" },
    "geometries": [{
      "coords": [
        [-74.564209, -0.175781],
        [-140.443271, -35.801086],
        [137.779541, -22.755921]
      ],
      "length": 3
    }]
  },
  {
    "properties": { "name": "south 2" },
    "geometries": [{
      "coords": [
        [-66.829834, -18.812718],
        [-146.781778, -82.179503],
        [118.795166, -20.797201]
      ],
      "length": 3
    }]
  }
];

// Expected WKT results (precise values for regression testing)
const expectedWkts = [
  'LINESTRING(-122 48,-97.728086 45.753682,-77 39)',
  'LINESTRING(-122 48,-64.165901 67.476242,0 51)',
  'LINESTRING(-75.9375 35.46067,-136.823034 -10.367409,146.25 -43.068888)',
  'LINESTRING(145.546875 48.458352,-157.284841 8.442054,-112.5 -37.71859)',
  'LINESTRING(-74.564209 -0.175781,-140.443271 -35.801086,137.779541 -22.755921)',
  'LINESTRING(-66.829834 -18.812718,-146.781778 -82.179503,118.795166 -20.797201)',
];

describe('Integration', () => {
  describe('Complex routes with dateline crossing', () => {
    routes.forEach((route, idx) => {
      test(`Route ${idx} (${route.properties.name}) should match expected output`, () => {
        const gc = new GreatCircle(route.start, route.end, route.properties);
        const line = gc.Arc(3);
        
        // Test internal structure matches expected
        expect(JSON.stringify(line)).toEqual(JSON.stringify(expectedArcs[idx]));
        
        // Test WKT output matches expected
        expect(line.wkt()).toBe(expectedWkts[idx]);
      });
    });
  });

  describe('GeoJSON output validation', () => {
    routes.forEach((route, idx) => {
      test(`Route ${idx} (${route.properties.name}) should produce valid GeoJSON`, () => {
        const gc = new GreatCircle(route.start, route.end, route.properties);
        const line = gc.Arc(3);
        const geojson = line.json();
        
        // Validate GeoJSON structure
        expect(geojson.type).toBe('Feature');
        expect(geojson.geometry).toBeDefined();
        expect(geojson.properties).toBeDefined();
        expect(geojson.properties).toEqual(route.properties);
        
        // Validate coordinates exist and are array
        expect('coordinates' in geojson.geometry).toBe(true);
        const coords = (geojson.geometry as any).coordinates;
        expect(Array.isArray(coords)).toBe(true);
        expect(coords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Dateline crossing behavior', () => {
    const datelineCrossingRoutes = routes.filter(route => 
      route.properties.name.includes('crosses dateline')
    );

    datelineCrossingRoutes.forEach((route, idx) => {
      test(`${route.properties.name} should handle dateline crossing`, () => {
        const gc = new GreatCircle(route.start, route.end, route.properties);
        const line = gc.Arc(3);
        
        expect(line.geometries.length).toBeGreaterThan(0);
        
        const coords = (line.json().geometry as any).coordinates;
        expect(coords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Southern hemisphere routes', () => {
    const southernRoutes = routes.filter(route => 
      route.properties.name.includes('south')
    );

    southernRoutes.forEach((route, idx) => {
      test(`${route.properties.name} should handle southern hemisphere`, () => {
        const gc = new GreatCircle(route.start, route.end, route.properties);
        const line = gc.Arc(3);
        
        expect(line.geometries.length).toBeGreaterThan(0);
        
        // Check that some coordinates have southern latitudes
        const coords = (line.json().geometry as any).coordinates;
        expect(Array.isArray(coords)).toBe(true);
        const hasSouthernLatitudes = coords.some((coord: number[]) => {
          return Array.isArray(coord) && coord.length > 1 && typeof coord[1] === 'number' && coord[1] < 0;
        });
        expect(hasSouthernLatitudes).toBe(true);
      });
    });
  });

  describe('Full workflow test', () => {
    test('should complete full workflow from coordinates to output formats', () => {
      const testRoute = routes[0]!; // Seattle to DC - non-null assertion since we know it exists
      
      const gc = new GreatCircle(testRoute.start, testRoute.end, testRoute.properties);
      const line = gc.Arc(3);
      
      // Test Arc instance
      expect(line).toBeDefined();
      expect(line.properties).toEqual(testRoute.properties);
      
      // Test GeoJSON output
      const geojson = line.json();
      expect(geojson.type).toBe('Feature');
      
      // Test WKT output
      const wkt = line.wkt();
      expect(typeof wkt).toBe('string');
      expect(wkt.startsWith('LINESTRING')).toBe(true);
    });
  });
});
