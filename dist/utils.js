"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2D = exports.D2R = void 0;
exports.roundCoords = roundCoords;
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
function roundCoords(coords) {
    // round coordinate decimal values to 6 places
    const PRECISION = 6;
    const MULTIPLIER = Math.pow(10, PRECISION);
    const rounded = [];
    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        if (coord !== undefined) {
            // https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
            rounded[i] = Math.round((coord + Number.EPSILON) * MULTIPLIER) / MULTIPLIER;
        }
    }
    return rounded;
}
/**
 * Convert degrees to radians
 */
exports.D2R = Math.PI / 180;
/**
 * Convert radians to degrees
 */
exports.R2D = 180 / Math.PI;
//# sourceMappingURL=utils.js.map