import { _LineString } from './line-string.js';
import type { GeoJSONFeature } from './types.js';
/**
 * Arc class representing the result of great circle calculations
 *
 * @param properties - Optional properties object
 *
 * @example
 * ```typescript
 * const arc = new Arc({ x: 45.123456789, y: 50.987654321 });
 * console.log(arc.json()); // { type: 'Feature', geometry: { type: 'LineString', coordinates: [ [Array] ] }, properties: { x: 45.123457, y: 50.987654 } }
 * ```
 */
export declare class Arc {
    properties: Record<string, any>;
    geometries: _LineString[];
    constructor(properties?: Record<string, any>);
    /**
     * Convert to GeoJSON Feature
     *
     * @returns GeoJSON Feature with LineString or MultiLineString geometry
     *
     * @example
     * ```typescript
     * const gc = new GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
     * const arc = gc.Arc(3);
     * console.log(arc.json());
     * // { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-122, 48], [-99.5, 43.5], [-77, 39]] }, properties: {} }
     * ```
     */
    json(): GeoJSONFeature;
    /**
     * Convert to WKT (Well Known Text) format
     *
     * @returns WKT string representation
     *
     * @example
     * ```typescript
     * const arc = new Arc({ name: 'test-arc' });
     * console.log(arc.wkt()); // "LINESTRING EMPTY" or "LINESTRING(lon lat,lon lat,...)"
     * ```
     */
    wkt(): string;
}
//# sourceMappingURL=arc.d.ts.map