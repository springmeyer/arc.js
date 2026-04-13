// Re-export GeoJSON types from the standard library
export type { 
  Feature as GeoJSONFeature,
  LineString,
  MultiLineString,
  Position
} from 'geojson';

/**
 * Core coordinate interface representing a point with x (longitude) and y (latitude)
 */
export interface CoordinatePoint {
  /** Longitude in degrees */
  x: number;
  /** Latitude in degrees */
  y: number;
}

/**
 * Options for Arc generation
 */
export interface ArcOptions {
  /**
   * @deprecated No-op. Retained for backwards compatibility.
   *
   * Previously controlled the dateline offset threshold used by the GDAL-ported
   * heuristic. The heuristic has since been replaced with an analytical bisection
   * approach — this field has no effect on output.
   */
  offset?: number;
}

/**
 * Internal line geometry representation
 */
export interface LineGeometry {
  coords: [number, number][];
  length: number;
}
