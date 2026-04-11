import type { CoordinatePoint, ArcOptions } from './types.js';
import { Coord } from './coord.js';
import { Arc } from './arc.js';
import { _LineString } from './line-string.js';
import { roundCoords, R2D } from './utils.js';


/**
 * Great Circle calculation class
 * http://en.wikipedia.org/wiki/Great-circle_distance
 * 
 * @param start - Start point
 * @param end - End point
 * @param properties - Optional properties object
 * 
 * @example
 * ```typescript
 * const greatCircle = new GreatCircle({ x: 45.123456789, y: 50.987654321 }, { x: 46.123456789, y: 51.987654321 });
 * console.log(greatCircle.interpolate(0.5)); // [45.623457, 51.487654]
 * ```
 */
export class GreatCircle {
    public readonly start: Coord;
    public readonly end: Coord;
    public readonly properties: Record<string, any>;
    private readonly g: number;

    constructor(start: CoordinatePoint, end: CoordinatePoint, properties?: Record<string, any>) {
        if (!start || start.x === undefined || start.y === undefined) {
            throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
        }
        if (!end || end.x === undefined || end.y === undefined) {
            throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
        }
        
        this.start = new Coord(start.x, start.y);
        this.end = new Coord(end.x, end.y);
        this.properties = properties || {};

        const w = this.start.x - this.end.x;
        const h = this.start.y - this.end.y;
        const z = Math.pow(Math.sin(h / 2.0), 2) +
                    Math.cos(this.start.y) *
                       Math.cos(this.end.y) *
                         Math.pow(Math.sin(w / 2.0), 2);
        this.g = 2.0 * Math.asin(Math.sqrt(z));

        if (this.g === Math.PI) {
            throw new Error('it appears ' + this.start.view() + ' and ' + this.end.view() + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");
        } else if (isNaN(this.g)) {
            throw new Error('could not calculate great circle between ' + start + ' and ' + end);
        }
    }

    /**
     * Interpolate along the great circle
     * http://williams.best.vwh.net/avform.htm#Intermediate
     * 
     * @param f - Interpolation factor
     * @returns Interpolated point
     * 
     * @example
     * ```typescript
     * const greatCircle = new GreatCircle({ x: 45.123456789, y: 50.987654321 }, { x: 46.123456789, y: 51.987654321 });
     * console.log(greatCircle.interpolate(0.5)); // [45.623457, 51.487654]
     * ```
     */
    interpolate(f: number): [number, number] {
        const A = Math.sin((1 - f) * this.g) / Math.sin(this.g);
        const B = Math.sin(f * this.g) / Math.sin(this.g);
        const x = A * Math.cos(this.start.y) * Math.cos(this.start.x) + B * Math.cos(this.end.y) * Math.cos(this.end.x);
        const y = A * Math.cos(this.start.y) * Math.sin(this.start.x) + B * Math.cos(this.end.y) * Math.sin(this.end.x);
        const z = A * Math.sin(this.start.y) + B * Math.sin(this.end.y);
        const lat = R2D * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        const lon = R2D * Math.atan2(y, x);
        return [lon, lat];
    }

    /**
     * Generate points along the great circle
     * 
     * @param npoints - Number of points to generate
     * @param options - Optional options object
     * @returns Arc object
     * 
     * @example
     * ```typescript
     * const greatCircle = new GreatCircle({ x: 45.123456789, y: 50.987654321 }, { x: 46.123456789, y: 51.987654321 });
     * console.log(greatCircle.Arc(10)); // Arc { geometries: [ [Array] ] }
     * ```
     */
    Arc(npoints: number = 100, _options?: ArcOptions): Arc {
        // NOTE: With npoints ≤ 2, no antimeridian splitting is performed.
        // A 2-point antimeridian route returns a single LineString spanning ±180°.
        // Renderers that support coordinate wrapping (e.g. MapLibre GL JS) handle this
        // correctly, whereas splitting would produce two disconnected straight-line stubs
        // with no great-circle curvature — arguably worse behavior. This is a known
        // limitation; open for maintainer discussion if a MultiLineString split is preferred.
        if (!npoints || npoints <= 2) {
            const arc = new Arc(this.properties);
            const line = new _LineString();
            arc.geometries.push(line);
            line.move_to(roundCoords([this.start.lon, this.start.lat]));
            line.move_to(roundCoords([this.end.lon, this.end.lat]));
            return arc;
        }

        // NOTE: options.offset was previously used as dfDateLineOffset in the GDAL-ported
        // heuristic. It is kept in ArcOptions for backwards compatibility but is a no-op here.

        const delta = 1.0 / (npoints - 1);
        const first_pass: [number, number][] = [];
        for (let i = 0; i < npoints; ++i) {
            first_pass.push(this.interpolate(delta * i));
        }

        // Analytical antimeridian splitting via bisection.
        // For each consecutive pair of points where |Δlon| > 180 (opposite sides of ±180°),
        // binary-search for the exact crossing fraction f* using interpolate(), then insert
        // [±180, lat*] boundary points and start a new segment. 50 iterations → sub-nanodegree precision.
        const segments: [number, number][][] = [];
        let current: [number, number][] = [];

        for (let i = 0; i < first_pass.length; i++) {
            const pt = first_pass[i]!;

            if (i === 0) {
                current.push(pt);
                continue;
            }

            const prev = first_pass[i - 1]!;

            if (Math.abs(pt[0] - prev[0]) > 180) {
                let lo = delta * (i - 1);
                let hi = delta * i;

                for (let iter = 0; iter < 50; iter++) {
                    const mid = (lo + hi) / 2;
                    const [midLon] = this.interpolate(mid);
                    const [loLon] = this.interpolate(lo);
                    if (Math.abs(midLon - loLon) < 180) {
                        lo = mid;
                    } else {
                        hi = mid;
                    }
                }

                const [, crossingLat] = this.interpolate((lo + hi) / 2);
                const fromEast = prev[0] > 0;

                current.push([fromEast ? 180 : -180, crossingLat]);
                segments.push(current);
                current = [[fromEast ? -180 : 180, crossingLat]];
            }

            current.push(pt);
        }

        if (current.length > 0) {
            segments.push(current);
        }

        const arc = new Arc(this.properties);
        for (const seg of segments) {
            const line = new _LineString();
            arc.geometries.push(line);
            for (const pt of seg) {
                line.move_to(roundCoords([pt[0], pt[1]]));
            }
        }
        return arc;
    }
}
