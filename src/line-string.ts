import type { Position } from './types.js';

/**
 * Internal LineString class for building geometries
 */
export class LineString {
    public coords: Position[] = [];
    public length: number = 0;

    move_to(coord: Position): void {
        this.length++;
        this.coords.push(coord);
    }
}
