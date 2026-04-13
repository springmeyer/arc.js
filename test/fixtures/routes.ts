/**
 * Shared test fixtures: named coordinate points, route arrays, and factory helpers.
 * All coordinates are [longitude, latitude] in decimal degrees (WGS84).
 *
 * Run `node scripts/dump-fixtures.mjs` to export routes as GeoJSON for
 * visual verification at geojson.io.
 */

// ---------------------------------------------------------------------------
// Named coordinate points
// ---------------------------------------------------------------------------

/** Generic origin used in unit tests that don't need a real location. */
export const ORIGIN = { x: 0, y: 0 };

/** Generic second point 10° east of the origin - paired with ORIGIN for unit tests. */
export const TEN_EAST = { x: 10, y: 0 };

/** Seattle, WA - used in non-crossing domestic route tests. */
export const SEATTLE = { x: -122, y: 48 };

/** Washington, DC - used in non-crossing domestic route tests. */
export const DC = { x: -77, y: 39 };

/** San Francisco, CA (precise) - used in TypeScript type tests. */
export const SAN_FRANCISCO = { x: -122.4194, y: 37.7749 };

/** New York, NY (precise) - used in TypeScript type tests. */
export const NEW_YORK = { x: -74.0059, y: 40.7128 };

// ---------------------------------------------------------------------------
// Antipodal pair - GreatCircle constructor must throw for these
// ---------------------------------------------------------------------------
export const ANTIPODAL = {
  start: { x: 1, y: 1 },
  end:   { x: -179, y: -1 },
  expectedError: "it appears 1,1 and -179,-1 are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite",
};

// ---------------------------------------------------------------------------
// Test property factory
// Generates a default { name, color } properties object for route tests.
// Pass overrides to vary specific fields: makeProps({ color: 'blue' })
// ---------------------------------------------------------------------------
export function makeProps(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { name: 'Test Route', color: 'red', ...overrides };
}

// ---------------------------------------------------------------------------
// Route fixture types
// ---------------------------------------------------------------------------

export interface RouteFixture {
  name: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export interface NonCrossingFixture extends RouteFixture {
  /** Maximum allowed longitude difference (°) between consecutive sampled points.
   *  Tight bound (e.g. 20) for short routes; <180 for intercontinental routes where
   *  any jump ≥180 would indicate a spurious antimeridian split. */
  maxJump: number;
}

export interface IntegrationRouteFixture extends RouteFixture {
  properties: { name: string };
  crossesAntimeridian: boolean;
}

// ---------------------------------------------------------------------------
// npoints values exercised for antimeridian-crossing routes.
// 10 → large step size (~50°), the low-npoints regression from issue #75
// 100 → fine-grained, original failure mode from PR #55 / turf#3030
// ---------------------------------------------------------------------------
export const SPLIT_NPOINTS = [10, 100] as const;

// ---------------------------------------------------------------------------
// Antimeridian-crossing routes
// ---------------------------------------------------------------------------

// East-to-west Pacific crossings (positive → negative longitude)
// Note: Auckland → LAX also covers the south-to-north hemisphere case.
export const EAST_TO_WEST: RouteFixture[] = [
  { name: 'Tokyo → LAX',    start: { x: 139.7798, y: 35.5494 }, end: { x: -118.4085, y: 33.9416 } },
  { name: 'Auckland → LAX', start: { x: 174.79,   y: -36.85  }, end: { x: -118.41,   y: 33.94   } },
  { name: 'Shanghai → SFO', start: { x: 121.81,   y: 31.14   }, end: { x: -122.38,   y: 37.62   } },
];

// West-to-east Pacific crossings (negative → positive longitude)
export const WEST_TO_EAST: RouteFixture[] = [
  { name: 'LAX → Tokyo',    start: { x: -118.4085, y: 33.9416 }, end: { x: 139.7798, y: 35.5494 } },
  { name: 'LAX → Auckland', start: { x: -118.41,   y: 33.94   }, end: { x: 174.79,   y: -36.85  } },
  { name: 'SFO → Shanghai', start: { x: -122.38,   y: 37.62   }, end: { x: 121.81,   y: 31.14   } },
];

// South-to-south Pacific crossings (both endpoints in southern hemisphere)
export const SOUTH_TO_SOUTH_E_TO_W: RouteFixture[] = [
  { name: 'Sydney → Buenos Aires', start: { x: 151.21, y: -33.87 }, end: { x: -58.38, y: -34.60 } },
];

export const SOUTH_TO_SOUTH_W_TO_E: RouteFixture[] = [
  { name: 'Buenos Aires → Sydney', start: { x: -58.38, y: -34.60 }, end: { x: 151.21, y: -33.87 } },
];

// ---------------------------------------------------------------------------
// High-latitude routes that approach the poles (may or may not cross antimeridian)
// ---------------------------------------------------------------------------
export const HIGH_LATITUDE: RouteFixture[] = [
  { name: 'Oslo → Anchorage', start: { x: 10.74, y: 59.91 }, end: { x: -149.9,  y: 61.22 } },
  { name: 'London → Seattle', start: { x: -0.12, y: 51.51 }, end: { x: -122.33, y: 47.61 } },
];

// ---------------------------------------------------------------------------
// Non-crossing routes - should always produce LineString
// ---------------------------------------------------------------------------
export const NON_CROSSING: NonCrossingFixture[] = [
  { name: 'Seattle → DC',    start: { x: -122.0, y: 48.0  }, end: { x: -77.0, y: 39.0  }, maxJump: 20  },
  { name: 'NYC → London',    start: { x: -74.0,  y: 40.71 }, end: { x: -0.13, y: 51.51 }, maxJump: 180 },
  { name: 'NYC → Paris',     start: { x: -74.0,  y: 40.71 }, end: { x: 2.35,  y: 48.85 }, maxJump: 180 },
  { name: 'Lagos → Colombo', start: { x: 3.4,    y: 6.5   }, end: { x: 79.9,  y: 6.9   }, maxJump: 180 },
];

// ---------------------------------------------------------------------------
// Integration test routes - real-world routes covering format/property pass-through.
// Splitting correctness for crossing routes is owned by antimeridian.test.ts.
// ---------------------------------------------------------------------------
export const INTEGRATION_ROUTES: IntegrationRouteFixture[] = [
  {
    start: { x: -122, y: 48 },
    end: { x: -77, y: 39 },
    properties: { name: 'Seattle → DC' },
    crossesAntimeridian: false,
    name: 'Seattle → DC',
  },
  {
    start: { x: -122, y: 48 },
    end: { x: 0, y: 51 },
    properties: { name: 'Seattle → London' },
    crossesAntimeridian: false,
    name: 'Seattle → London',
  },
  {
    start: { x: -75.9375, y: 35.460669951495305 },
    end: { x: 146.25, y: -43.06888777416961 },
    properties: { name: 'Pamlico Sound, NC, USA → Tasmania, Australia' },
    crossesAntimeridian: true,
    name: 'Pamlico Sound, NC, USA → Tasmania, Australia',
  },
  {
    start: { x: 145.54687500000003, y: 48.45835188280866 },
    end: { x: -112.5, y: -37.71859032558814 },
    properties: { name: 'Sea of Okhotsk, Russia → Southern Pacific Ocean' },
    crossesAntimeridian: true,
    name: 'Sea of Okhotsk, Russia → Southern Pacific Ocean',
  },
  {
    start: { x: -74.564208984375, y: -0.17578097424708533 },
    end: { x: 137.779541015625, y: -22.75592068148639 },
    properties: { name: 'Colombia/Peru border → Northern Territory, Australia' },
    crossesAntimeridian: true,
    name: 'Colombia/Peru border → Northern Territory, Australia',
  },
  {
    start: { x: -66.829833984375, y: -18.81271785640776 },
    end: { x: 118.795166015625, y: -20.797201434306984 },
    properties: { name: 'Challapata, Bolivia → Western Australia, Australia' },
    crossesAntimeridian: true,
    name: 'Challapata, Bolivia → Western Australia, Australia',
  },
];
