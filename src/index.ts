// Dual module exports (works for both CommonJS and ESM)
export { Coord } from './coord';
export { Arc } from './arc';
export { GreatCircle } from './great-circle';
export { roundCoords, D2R, R2D } from './utils';

// Export types
export type { CoordinatePoint, ArcOptions, GeoJSONFeature, LineString, MultiLineString } from './types';
