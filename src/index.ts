// Dual module exports (works for both CommonJS and ESM)
export { Coord } from './coord-class.js';
export { Arc } from './arc-class.js';
export { GreatCircle } from './great-circle-class.js';
export { roundCoords, D2R, R2D } from './utils.js';

// Export types
export type { CoordinatePoint, ArcOptions, GeoJSONFeature, LineString, MultiLineString } from './types.js';
