import type { Position } from './types.js';
/**
 * Round coordinate decimal values to 6 places for precision
 *
 * @param coords - A coordinate position (longitude, latitude, optional elevation)
 * @returns Rounded coordinate position
 *
 * @example
 * ```typescript
 * const coords = [45.123456789, 50.987654321];
 * const roundedCoords = roundCoords(coords);
 * console.log(roundedCoords); // [45.123457, 50.987654]
 * ```
 */
export declare function roundCoords(coords: Position): Position;
/**
 * Convert degrees to radians
 */
export declare const D2R: number;
/**
 * Convert radians to degrees
 */
export declare const R2D: number;
//# sourceMappingURL=utils.d.ts.map