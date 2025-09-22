/**
 * TypeScript-specific tests for type safety, inference, and compile-time validation
 * These tests focus on TypeScript features that aren't covered by functional tests
 */

import { Arc, Coord, GreatCircle, CoordinatePoint, ArcOptions, GeoJSONFeature } from '../src';
import { expectTypeOf } from 'expect-type';

// Test data with proper TypeScript typing
const sanFrancisco: CoordinatePoint = { x: -122.4194, y: 37.7749 };
const newYork: CoordinatePoint = { x: -74.0059, y: 40.7128 };
const testProperties = { 
  name: 'TypeScript Test Route', 
  id: 'ts-001',
  metadata: { framework: 'Jest', language: 'TypeScript' }
};

describe('TypeScript', () => {
  describe('Type inference and safety', () => {
    test('should infer correct types for Coord class', () => {
      const coord = new Coord(-122.4194, 37.7749);
      
      // Test TypeScript type inference for properties
      expectTypeOf(coord.lon).toEqualTypeOf<number>();
      expectTypeOf(coord.lat).toEqualTypeOf<number>();
      expectTypeOf(coord.x).toEqualTypeOf<number>();
      expectTypeOf(coord.y).toEqualTypeOf<number>();
      
      // Test TypeScript type inference for method return types
      expectTypeOf(coord.view()).toEqualTypeOf<string>();
      expectTypeOf(coord.antipode()).toEqualTypeOf<Coord>();
      
      // Runtime validation that types match actual values
      expect(typeof coord.lon).toBe('number');
      expect(typeof coord.view()).toBe('string');
      expect(coord.antipode()).toBeInstanceOf(Coord);
    });

    test('should accept CoordinatePoint interface', () => {
      // Test interface compatibility and type inference
      const gc = new GreatCircle(sanFrancisco, newYork, testProperties);
      
      expectTypeOf(sanFrancisco).toEqualTypeOf<CoordinatePoint>();
      expectTypeOf(gc).toEqualTypeOf<GreatCircle>();
      
      expect(gc).toBeInstanceOf(GreatCircle);
      expect(gc.properties).toEqual(testProperties);
    });

    test('should handle optional ArcOptions parameter', () => {
      const gc = new GreatCircle(sanFrancisco, newYork);
      
      // Test method overloads - without options
      const arc1 = gc.Arc(10);
      expectTypeOf(arc1).toEqualTypeOf<Arc>();
      
      // Test method overloads - with options
      const options: ArcOptions = { offset: 15 };
      const arc2 = gc.Arc(10, options);
      expectTypeOf(arc2).toEqualTypeOf<Arc>();
      
      expect(arc1).toBeInstanceOf(Arc);
      expect(arc2).toBeInstanceOf(Arc);
    });
  });

  describe('Generic and flexible typing', () => {
    test('should allow flexible properties objects', () => {
      // Test that properties accept flexible object structures
      const flexibleProps = {
        name: 'Flexible Route',
        count: 42,
        active: true,
        tags: ['arc', 'typescript'],
        config: { precision: 6, units: 'degrees' }
      };
      
      const arc = new Arc(flexibleProps);
      
      // Runtime validation that property types are preserved
      expect(arc.properties.name).toBe('Flexible Route');
      expect(arc.properties.count).toBe(42);
      expect(arc.properties.active).toBe(true);
      expect(Array.isArray(arc.properties.tags)).toBe(true);
      expect(typeof arc.properties.config).toBe('object');
    });

    test('should support method chaining with proper types', () => {
      const result = new GreatCircle(sanFrancisco, newYork, testProperties)
        .Arc(25)
        .json();
      
      // Test method chaining type inference
      expectTypeOf(result).toEqualTypeOf<GeoJSONFeature>();
      expectTypeOf(result.type).toEqualTypeOf<'Feature'>();
      
      expect(result.type).toBe('Feature');
      expect(result.properties).toEqual(testProperties);
    });
  });

  describe('Compile-time type validation', () => {
    test('should enforce CoordinatePoint structure', () => {
      // Test valid CoordinatePoint interface usage (compile-time validation)
      const validPoint1: CoordinatePoint = { x: 0, y: 0 };
      const validPoint2: CoordinatePoint = { x: -180, y: -90 };
      const validPoint3: CoordinatePoint = { x: 180, y: 90 };
      
      expect(validPoint1.x).toBe(0);
      expect(validPoint2.x).toBe(-180);
      expect(validPoint3.x).toBe(180);
      
      // TypeScript would catch these at compile time:
      // const invalid1: CoordinatePoint = { x: 0 }; // Missing y
      // const invalid2: CoordinatePoint = { y: 0 }; // Missing x
      // const invalid3: CoordinatePoint = { lon: 0, lat: 0 }; // Wrong properties
    });

    test('should provide proper return type annotations', () => {
      const gc = new GreatCircle(sanFrancisco, newYork);
      
      // Test tuple return type inference
      const interpolated = gc.interpolate(0.5);
      expectTypeOf(interpolated).toEqualTypeOf<[number, number]>();
      
      expect(Array.isArray(interpolated)).toBe(true);
      expect(interpolated).toHaveLength(2);
      expect(typeof interpolated[0]).toBe('number');
      expect(typeof interpolated[1]).toBe('number');
    });
  });

  describe('Module system compatibility', () => {
    test('should support named imports from source', () => {
      // Runtime validation that imports resolved to constructors
      expect(typeof Coord).toBe('function');
      expect(typeof GreatCircle).toBe('function');
      expect(typeof Arc).toBe('function');
      
      // Test that imported classes are usable constructors
      const coord = new Coord(0, 0);
      const gc = new GreatCircle(sanFrancisco, newYork);
      const arc = new Arc();
      
      expect(coord).toBeInstanceOf(Coord);
      expect(gc).toBeInstanceOf(GreatCircle);
      expect(arc).toBeInstanceOf(Arc);
    });

    test('should handle type-only imports correctly', () => {
      // Test type-only imports (compile-time only, no runtime footprint)
      
      const point: CoordinatePoint = { x: 1, y: 2 };
      const options: ArcOptions = { offset: 10 };
      
      expect(point.x).toBe(1);
      expect(options.offset).toBe(10);
      
      // Type-only imports don't create runtime values
      // (Can only validate the objects that use these types work correctly)
      expect(point).toBeDefined();
      expect(options).toBeDefined();
    });
  });
});
