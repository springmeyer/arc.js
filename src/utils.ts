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
export function roundCoords(coords: Position): Position {
    // round coordinate decimal values to 6 places
    const PRECISION = 6;
    const MULTIPLIER = Math.pow(10, PRECISION);

    const rounded: Position = [];
    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        if (coord !== undefined) {
            // https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
            rounded[i] = Math.round(
                (coord + Number.EPSILON) * MULTIPLIER
            ) / MULTIPLIER;
        }
    }

    return rounded;
}

// Constants used across the library
export const D2R = Math.PI / 180;
export const R2D = 180 / Math.PI;

