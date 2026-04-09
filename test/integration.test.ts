import { GreatCircle, CoordinatePoint } from '../src';
import type { MultiLineString, LineString } from 'geojson';

// Complex real-world routes for integration testing
interface TestRoute {
  start: CoordinatePoint;
  end: CoordinatePoint;
  properties: { name: string };
  crossesAntimeridian: boolean;
}

const routes: TestRoute[] = [
  {
    start: { x: -122, y: 48 },
    end: { x: -77, y: 39 },
    properties: { name: 'Seattle → DC' },
    crossesAntimeridian: false
  },
  {
    start: { x: -122, y: 48 },
    end: { x: 0, y: 51 },
    properties: { name: 'Seattle → London' },
    crossesAntimeridian: false
  },
  {
    start: { x: -75.9375, y: 35.460669951495305 },
    end: { x: 146.25, y: -43.06888777416961 },
    properties: { name: 'Pamlico Sound, NC, USA → Tasmania, Australia' },
    crossesAntimeridian: true
  },
  {
    start: { x: 145.54687500000003, y: 48.45835188280866 },
    end: { x: -112.5, y: -37.71859032558814 },
    properties: { name: 'Sea of Okhotsk, Russia → Southern Pacific Ocean' },
    crossesAntimeridian: true
  },
  {
    start: { x: -74.564208984375, y: -0.17578097424708533 },
    end: { x: 137.779541015625, y: -22.75592068148639 },
    properties: { name: 'Colombia/Peru border → Northern Territory, Australia' },
    crossesAntimeridian: true
  },
  {
    start: { x: -66.829833984375, y: -18.81271785640776 },
    end: { x: 118.795166015625, y: -20.797201434306984 },
    properties: { name: 'Challapata, Bolivia → Western Australia, Australia' },
    crossesAntimeridian: true
  }
];

// Exact snapshots for non-crossing routes only.
// Splitting correctness for crossing routes (indices 2–5) is owned by antimeridian.test.ts.
// Integration tests verify output format and property pass-through.
const expectedArcs = [
  {
    "properties": { "name": "Seattle → DC" },
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
    "properties": { "name": "Seattle → London" },
    "geometries": [{
      "coords": [
        [-122, 48],
        [-64.165901, 67.476242],
        [0, 51]
      ],
      "length": 3
    }]
  }
];

const expectedWkts = [
  'LINESTRING(-122 48,-97.728086 45.753682,-77 39)',
  'LINESTRING(-122 48,-64.165901 67.476242,0 51)',
];

describe('Integration', () => {
  describe('Complex routes with dateline crossing', () => {
    routes.forEach((route, idx) => {
      test(`Route ${idx} (${route.properties.name}) should match expected output`, () => {
        const gc = new GreatCircle(route.start, route.end, route.properties);
        const line = gc.Arc(3);

        if (!route.crossesAntimeridian) {
          // Non-crossing routes: exact snapshot (LineString structure is stable)
          expect(JSON.stringify(line)).toEqual(JSON.stringify(expectedArcs[idx]));
          expect(line.wkt()).toBe(expectedWkts[idx]);
        } else {
          // Crossing routes: verify output format and property pass-through only.
          // Splitting correctness (MultiLineString, ±180 boundaries) is in antimeridian.test.ts.
          const geojson = line.json();
          expect(geojson.type).toBe('Feature');
          expect(geojson.properties).toEqual(route.properties);
          // WKT serializer must produce two LINESTRING parts for split routes
          expect(line.wkt()).toContain('; ');
        }
      });
    });
  });

  describe('GeoJSON output validation', () => {
    routes.forEach((route, idx) => {
      test(`Route ${idx} (${route.properties.name}) should produce valid GeoJSON`, () => {
        const gc = new GreatCircle(route.start, route.end, route.properties);
        const line = gc.Arc(3);
        const geojson = line.json();

        expect(geojson.type).toBe('Feature');
        expect(geojson.geometry).toBeDefined();
        expect(geojson.properties).toBeDefined();
        expect(geojson.properties).toEqual(route.properties);

        expect('coordinates' in geojson.geometry).toBe(true);
        const coords = (geojson.geometry as any).coordinates;
        expect(Array.isArray(coords)).toBe(true);
        expect(coords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Southern hemisphere routes', () => {
    const southernRoutes = routes.filter(route =>
      route.start.y < 0 || route.end.y < 0
    );

    southernRoutes.forEach((route) => {
      test(`${route.properties.name} should produce coordinates with southern latitudes`, () => {
        const gc = new GreatCircle(route.start, route.end, route.properties);
        const line = gc.Arc(3);

        // Flatten MultiLineString coordinates before checking for southern latitudes.
        // Without flattening, coords.some() iterates over number[][] (sub-arrays),
        // not number[] (individual points), so coord[1] would be an array, not a latitude.
        const geojson = line.json();
        const allCoords: number[][] = geojson.geometry.type === 'MultiLineString'
          ? (geojson.geometry as MultiLineString).coordinates.flat()
          : (geojson.geometry as LineString).coordinates;

        const hasSouthernLatitudes = allCoords.some((coord: number[]) => {
          return Array.isArray(coord) && coord.length > 1 && typeof coord[1] === 'number' && coord[1] < 0;
        });
        expect(hasSouthernLatitudes).toBe(true);
      });
    });
  });

  describe('Full workflow test', () => {
    test('should complete full workflow from coordinates to output formats', () => {
      const testRoute = routes[0]!; // Seattle → DC

      const gc = new GreatCircle(testRoute.start, testRoute.end, testRoute.properties);
      const line = gc.Arc(3);

      expect(line).toBeDefined();
      expect(line.properties).toEqual(testRoute.properties);

      const geojson = line.json();
      expect(geojson.type).toBe('Feature');

      const wkt = line.wkt();
      expect(typeof wkt).toBe('string');
      expect(wkt.startsWith('LINESTRING')).toBe(true);
    });
  });
});
