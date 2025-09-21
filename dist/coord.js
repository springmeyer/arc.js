"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coord = void 0;
const utils_js_1 = require("./utils.js");
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
class Coord {
    lon;
    lat;
    x;
    y;
    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
        this.x = utils_js_1.D2R * lon;
        this.y = utils_js_1.D2R * lat;
    }
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
    view() {
        return String(this.lon).slice(0, 4) + ',' + String(this.lat).slice(0, 4);
    }
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
    antipode() {
        const anti_lat = -1 * this.lat;
        const anti_lon = (this.lon < 0) ? 180 + this.lon : (180 - this.lon) * -1;
        return new Coord(anti_lon, anti_lat);
    }
}
exports.Coord = Coord;
//# sourceMappingURL=coord.js.map