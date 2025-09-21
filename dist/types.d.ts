export type { Feature as GeoJSONFeature, LineString, MultiLineString, Position } from 'geojson';
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
     * Offset from dateline in degrees (default: 10)
     * Controls the likelihood that lines will be split which cross the dateline.
     * The higher the number the more likely. Lines within this many degrees
     * of the dateline will be split.
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
//# sourceMappingURL=types.d.ts.map