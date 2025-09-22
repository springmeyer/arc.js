"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._LineString = void 0;
/**
 * Internal LineString class for building geometries
 */
class _LineString {
    coords = [];
    length = 0;
    /**
     * Add a coordinate to the line string
     *
     * @param coord - Coordinate position to add
     */
    move_to(coord) {
        this.length++;
        this.coords.push(coord);
    }
}
exports._LineString = _LineString;
//# sourceMappingURL=line-string.js.map