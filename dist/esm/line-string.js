/**
 * Internal LineString class for building geometries
 */
export class _LineString {
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
//# sourceMappingURL=line-string.js.map