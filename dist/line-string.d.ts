import type { Position } from './types.js';
/**
 * Internal LineString class for building geometries
 */
export declare class _LineString {
    coords: Position[];
    length: number;
    /**
     * Add a coordinate to the line string
     *
     * @param coord - Coordinate position to add
     */
    move_to(coord: Position): void;
}
//# sourceMappingURL=line-string.d.ts.map