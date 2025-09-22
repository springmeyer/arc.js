import * as arc from '../src';

describe('Index exports', () => {
  test('should export all public classes and functions', () => {
    expect(arc.Coord).toBeDefined();
    expect(arc.Arc).toBeDefined();
    expect(arc.GreatCircle).toBeDefined();
    expect(arc.roundCoords).toBeDefined();
    expect(arc.D2R).toBeDefined();
    expect(arc.R2D).toBeDefined();
  });

  test('should export types', () => {
    // These are type-only exports, so we can't test them at runtime
    // but we can verify the module loads without errors
    expect(typeof arc.Coord).toBe('function');
    expect(typeof arc.Arc).toBe('function');
    expect(typeof arc.GreatCircle).toBe('function');
    expect(typeof arc.roundCoords).toBe('function');
    expect(typeof arc.D2R).toBe('number');
    expect(typeof arc.R2D).toBe('number');
  });
});
