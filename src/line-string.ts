import type { Position } from './types.js';

/**
 * Internal LineString class for building geometries
 */
export class _LineString {
    public coords: Position[] = [];
    public length: number = 0;

    /**
     * Add a coordinate to the line string
     * 
     * @param coord - Coordinate position to add
     */
    move_to(coord: Position): void {
        this.length++;
        this.coords.push(coord);
    }
}
