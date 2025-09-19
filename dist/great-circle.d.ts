import type { CoordinatePoint, ArcOptions } from './types.js';
import { Coord } from './coord.js';
import { Arc } from './arc.js';
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
export declare class GreatCircle {
    readonly start: Coord;
    readonly end: Coord;
    readonly properties: Record<string, any>;
    private readonly g;
    constructor(start: CoordinatePoint, end: CoordinatePoint, properties?: Record<string, any>);
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
    interpolate(f: number): [number, number];
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
    Arc(npoints?: number, options?: ArcOptions): Arc;
}
//# sourceMappingURL=great-circle.d.ts.map