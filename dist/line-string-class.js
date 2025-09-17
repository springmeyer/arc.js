"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineString = void 0;
/**
 * Internal LineString class for building geometries
 */
class LineString {
    coords = [];
    length = 0;
    move_to(coord) {
        this.length++;
        this.coords.push(coord);
    }
}
exports.LineString = LineString;
//# sourceMappingURL=line-string-class.js.map