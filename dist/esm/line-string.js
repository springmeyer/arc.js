/**
 * Internal LineString class for building geometries
 */
export class LineString {
    coords = [];
    length = 0;
    move_to(coord) {
        this.length++;
        this.coords.push(coord);
    }
}
//# sourceMappingURL=line-string.js.map