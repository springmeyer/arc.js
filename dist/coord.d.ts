/**
 * Coordinate class representing a point with longitude and latitude
 *
 * @param lon - Longitude value
 * @param lat - Latitude value
 *
 * @example
 * ```typescript
 * const coord = new Coord(45.123456789, 50.987654321);
 * console.log(coord.lon); // 45.123457
 * console.log(coord.lat); // 50.987654
 * ```
 */
export declare class Coord {
    readonly lon: number;
    readonly lat: number;
    readonly x: number;
    readonly y: number;
    constructor(lon: number, lat: number);
    /**
     * Get a string representation of the coordinate
     *
     * @returns String representation of the coordinate
     *
     * @example
     * ```typescript
     * const coord = new Coord(45.123456789, 50.987654321);
     * console.log(coord.view()); // "45.123457,50.987654"
     * ```
     */
    view(): string;
    /**
     * Get the antipodal point (diametrically opposite point on the sphere)
     *
     * @returns Antipodal point
     *
     * @example
     * ```typescript
     * const coord = new Coord(45.123456789, 50.987654321);
     * console.log(coord.antipode()); // Coord { lon: -45.123457, lat: -50.987654 }
     * ```
     */
    antipode(): Coord;
}
//# sourceMappingURL=coord.d.ts.map