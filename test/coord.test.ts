import { Coord } from '../src';

describe('Coord', () => {
  describe('Basic properties', () => {
    test('should initialize with correct longitude and latitude', () => {
      const coord = new Coord(0, 0);
      expect(coord.lon).toBe(0);
      expect(coord.lat).toBe(0);
      expect(coord.x).toBe(0); // x (radians) should be 0
      expect(coord.y).toBe(0); // y (radians) should be 0
    });
  });

  describe('view() method', () => {
    test('should return formatted string', () => {
      const coord = new Coord(0, 0);
      expect(coord.view()).toBe('0,0');
    });

    test('should format coordinates correctly', () => {
      const coord = new Coord(-122.4194, 37.7749);
      expect(coord.view()).toBe('-122,37.7');
    });
  });

  describe('antipode() method', () => {
    test('antipode of (0,0) should be (-180,0)', () => {
      const coord = new Coord(0, 0);
      const antipode = coord.antipode();
      expect(antipode.view()).toBe('-180,0');
    });

    test('should calculate antipode longitude correctly', () => {
      const coord = new Coord(-122, 37);
      const antipode = coord.antipode();
      expect(antipode.lon).toBe(58); // -122 + 180 = 58
    });

    test('should calculate antipode latitude correctly', () => {
      const coord = new Coord(-122, 37);
      const antipode = coord.antipode();
      expect(antipode.lat).toBe(-37); // -37
    });
  });

  describe('Edge cases', () => {
    test('should handle North pole latitude', () => {
      const coord = new Coord(0, 90);
      expect(coord.lat).toBe(90);
    });

    test('should handle South pole latitude', () => {
      const coord = new Coord(0, -90);
      expect(coord.lat).toBe(-90);
    });

    test('should handle dateline longitude', () => {
      const coord = new Coord(180, 0);
      expect(coord.lon).toBe(180);
    });
  });
});
