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
export class Arc {
    properties = {};
    geometries = [];
    constructor(properties) {
        if (properties)
            this.properties = properties;
    }
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
    json() {
        // Handle empty case
        if (this.geometries.length === 0) {
            return {
                type: 'Feature',
                // NOTE: coordinates: null is non-standard GeoJSON (RFC 7946 specifies empty array [])
                // but maintained for backward compatibility with original arc.js behavior
                geometry: { type: 'LineString', coordinates: null },
                properties: this.properties
            };
        }
        // Handle single LineString
        if (this.geometries.length === 1) {
            const firstGeometry = this.geometries[0];
            if (!firstGeometry) {
                return {
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: [] },
                    properties: this.properties
                };
            }
            return {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: firstGeometry.coords },
                properties: this.properties
            };
        }
        // Handle multiple LineStrings as MultiLineString
        const coordinates = this.geometries
            .filter(geom => geom !== undefined)
            .map(geom => geom.coords);
        return {
            type: 'Feature',
            geometry: { type: 'MultiLineString', coordinates },
            properties: this.properties
        };
    }
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
    wkt() {
        if (this.geometries.length === 0) {
            return '';
        }
        let wktParts = [];
        for (const geometry of this.geometries) {
            if (!geometry || geometry.coords.length === 0) {
                wktParts.push('LINESTRING EMPTY');
                continue;
            }
            const coordStrings = geometry.coords
                .filter(coord => coord !== undefined)
                .map(coord => {
                const lon = coord[0] ?? 0;
                const lat = coord[1] ?? 0;
                return `${lon} ${lat}`;
            });
            if (coordStrings.length === 0) {
                wktParts.push('LINESTRING EMPTY');
            }
            else {
                wktParts.push(`LINESTRING(${coordStrings.join(',')})`);
            }
        }
        return wktParts.join('; ');
    }
}
//# sourceMappingURL=arc.js.map