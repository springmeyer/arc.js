import type { GeoJSONFeature, LineString as GeoJSONLineString, MultiLineString as GeoJSONMultiLineString, Position } from './types.js';
import { LineString } from './line-string.js';

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
    public properties: Record<string, any> = {};
    public geometries: LineString[] = [];

    constructor(properties?: Record<string, any>) {
        if (properties) this.properties = properties;
    }

    /**
     * Convert to GeoJSON Feature
     * 
     * @returns GeoJSON Feature with LineString or MultiLineString geometry
     * 
     * @example
     * ```typescript
     * const arc = new Arc({ name: 'test-arc' });
     * console.log(arc.json()); // { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: { name: 'test-arc' } }
     * ```
     */
    json(): GeoJSONFeature {
        return this._emptyFeature() ?? this._singleFeature() ?? this._multiFeature();
    }

    private _emptyFeature(): GeoJSONFeature | null {
        if (this.geometries.length === 0) {
            return {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: [] },
                properties: this.properties
            };
        }
        return null;
    }

    private _singleFeature(): GeoJSONFeature | null {
        const firstGeometry = this.geometries[0];
        if (firstGeometry) {
            return {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: firstGeometry.coords },
                properties: this.properties
            };
        }
        return null;
    }

    private _multiFeature(): GeoJSONFeature {
        const coordinates: Position[][] = this.geometries
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
     * console.log(arc.wkt()); // "LINESTRING EMPTY" or "LINESTRING(lon lat, lon lat, ...)"
     * ```
     */
    wkt(): string {
        const wktParts: string[] = [];

        for (const geometry of this.geometries) {
            wktParts.push(this._wktForGeometry(geometry));
        }

        return wktParts.join('; ');
    }

    private _wktForGeometry(geometry?: LineString): string {
        if (!geometry || geometry.coords.length === 0) {
            return 'LINESTRING EMPTY';
        }

        const coordStrings = geometry.coords
            .filter(coord => coord !== undefined)
            .map(coord => `${coord[0] ?? 0} ${coord[1] ?? 0}`);

        if (coordStrings.length === 0) {
            return 'LINESTRING EMPTY';
        }

        return `LINESTRING(${coordStrings.join(', ')})`;
    }
}
