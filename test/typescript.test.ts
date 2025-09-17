/**
 * TypeScript-specific tests for type safety and inference
 * These tests validate that our TypeScript definitions work correctly
 */

import test from 'tape';
import { Coord, Arc, GreatCircle, CoordinatePoint, ArcOptions } from '../dist/index';
import type { GeoJSONFeature } from '../dist/index';

test('TypeScript: Coord type inference and methods', (t) => {
    const coord: Coord = new Coord(-122.4194, 37.7749);
    
    // Properties should be numbers
    t.equal(typeof coord.lon, 'number', 'lon should be number');
    t.equal(typeof coord.lat, 'number', 'lat should be number');
    t.equal(typeof coord.x, 'number', 'x should be number');
    t.equal(typeof coord.y, 'number', 'y should be number');
    
    // Methods should return correct types
    const view: string = coord.view();
    const antipode: Coord = coord.antipode();
    
    t.equal(typeof view, 'string', 'view() should return string');
    t.ok(antipode instanceof Coord, 'antipode() should return Coord instance');
    
    t.end();
});

test('TypeScript: CoordinatePoint interface compatibility', (t) => {
    const start: CoordinatePoint = { x: -122.4194, y: 37.7749 };
    const end: CoordinatePoint = { x: -74.0059, y: 40.7128 };
    
    // Should accept CoordinatePoint objects
    const gc: GreatCircle = new GreatCircle(start, end);
    
    t.ok(gc instanceof GreatCircle, 'GreatCircle should accept CoordinatePoint objects');
    t.equal(typeof gc.start.lon, 'number', 'start coordinate should be converted to Coord');
    t.equal(typeof gc.end.lon, 'number', 'end coordinate should be converted to Coord');
    
    t.end();
});

test('TypeScript: GreatCircle with options and properties', (t) => {
    const start: CoordinatePoint = { x: -122, y: 48 };
    const end: CoordinatePoint = { x: -77, y: 39 };
    const properties = { name: 'Seattle to DC', color: 'blue' };
    
    // Constructor with all parameters
    const gc: GreatCircle = new GreatCircle(start, end, properties);
    
    // Arc method with options
    const options: ArcOptions = { offset: 15 };
    const arc: Arc = gc.Arc(100, options);
    
    // Method return types
    const interpolated: [number, number] = gc.interpolate(0.5);
    
    t.ok(gc instanceof GreatCircle, 'GreatCircle constructor works with types');
    t.ok(arc instanceof Arc, 'Arc() method returns Arc instance');
    t.equal(interpolated.length, 2, 'interpolate() returns coordinate pair');
    t.equal(typeof interpolated[0], 'number', 'interpolated longitude is number');
    t.equal(typeof interpolated[1], 'number', 'interpolated latitude is number');
    
    t.end();
});

test('TypeScript: Arc class and GeoJSON output types', (t) => {
    const arc: Arc = new Arc({ name: 'test-arc', id: 123 });
    
    // Properties should be flexible
    arc.properties.customField = 'custom value';
    arc.properties.numericField = 42;
    
    // JSON output should be properly typed
    const geojson: GeoJSONFeature = arc.json();
    const featureType: 'Feature' = geojson.type;
    
    // WKT output
    const wkt: string = arc.wkt();
    
    t.equal(featureType, 'Feature', 'GeoJSON type should be Feature');
    t.equal(typeof wkt, 'string', 'WKT should return string');
    t.ok(geojson.geometry, 'GeoJSON should have geometry');
    t.ok(geojson.properties, 'GeoJSON should have properties');
    
    t.end();
});

test('TypeScript: Method chaining and fluent API', (t) => {
    const result = new GreatCircle({ x: -122, y: 48 }, { x: -77, y: 39 })
        .Arc(50)
        .json();
    
    // Result should be properly typed
    const featureType = result.type; // Should be 'Feature'
    const hasGeometry = result.geometry !== null;
    
    t.equal(featureType, 'Feature', 'Chained result should be Feature');
    t.ok(hasGeometry, 'Chained result should have geometry');
    
    t.end();
});

test('TypeScript: Type constraints and validation', (t) => {
    // These should compile without errors
    const validCoord = new Coord(-180, -90);  // Valid range
    const validCoord2 = new Coord(180, 90);   // Valid range
    
    // CoordinatePoint must have x and y
    const validPoint: CoordinatePoint = { x: 0, y: 0 };
    
    // Properties can be any object
    const validProps: Record<string, any> = { 
        name: 'test', 
        count: 42, 
        active: true,
        metadata: { nested: 'value' }
    };
    
    const arc = new Arc(validProps);
    
    t.ok(validCoord instanceof Coord, 'Valid coordinates should work');
    t.ok(validCoord2 instanceof Coord, 'Valid coordinates should work');
    t.equal(typeof validPoint.x, 'number', 'CoordinatePoint.x should be number');
    t.equal(typeof validPoint.y, 'number', 'CoordinatePoint.y should be number');
    t.ok(arc instanceof Arc, 'Arc with valid properties should work');
    
    t.end();
});

test('TypeScript: Import patterns work correctly', (t) => {
    // Named imports should work (what we're using)
    t.ok(typeof Coord === 'function', 'Coord should be importable');
    t.ok(typeof Arc === 'function', 'Arc should be importable');
    t.ok(typeof GreatCircle === 'function', 'GreatCircle should be importable');
    
    // Type imports should not affect runtime (GeoJSONFeature is type-only)
    t.pass('Type imports work correctly and do not affect runtime');
    
    t.end();
});
