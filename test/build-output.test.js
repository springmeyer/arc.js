/**
 * Build output tests - Simple console-based testing
 * Tests the compiled dist/ files and browser bundle to ensure they work correctly
 */

console.log('🧪 Testing build output...\n');

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    process.exit(1);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test CommonJS require
test('CommonJS require() works', () => {
  const arc = require('../dist/index.js');
  
  assert(arc.GreatCircle, 'GreatCircle class exists');
  assert(arc.Coord, 'Coord class exists');
  assert(arc.Arc, 'Arc class exists');
  assert(typeof arc.GreatCircle === 'function', 'GreatCircle is a function');
  
  // Test README example
  const start = { x: -122, y: 48 };
  const end = { x: -77, y: 39 };
  const generator = new arc.GreatCircle(start, end, {'name': 'Seattle to DC'});
  const line = generator.Arc(100, {offset: 10});
  
  assert(line, 'Arc generation works');
  assert(line.properties.name === 'Seattle to DC', 'Properties preserved');
  assert(line.json().type === 'Feature', 'Returns GeoJSON Feature');
});

// Test browser bundle
test('Browser bundle (arc.js) works', () => {
  const arc = require('../arc.js');
  
  assert(arc.GreatCircle, 'GreatCircle class exists in bundle');
  assert(arc.Coord, 'Coord class exists in bundle');
  assert(arc.Arc, 'Arc class exists in bundle');
  
  const start = { x: -122, y: 48 };
  const end = { x: -77, y: 39 };
  const generator = new arc.GreatCircle(start, end, {'name': 'Bundle Test'});
  const line = generator.Arc(3);
  
  assert(line, 'Bundle Arc generation works');
  assert(line.properties.name === 'Bundle Test', 'Bundle properties preserved');
  assert(line.json().type === 'Feature', 'Bundle returns GeoJSON Feature');
});

// Test output consistency
test('Output consistency between package and bundle', () => {
  const arcPackage = require('../dist/index.js');
  const arcBundle = require('../arc.js');
  
  const start = { x: -122, y: 48 };
  const end = { x: -77, y: 39 };
  
  const gc1 = new arcPackage.GreatCircle(start, end);
  const gc2 = new arcBundle.GreatCircle(start, end);
  
  const line1 = gc1.Arc(5);
  const line2 = gc2.Arc(5);
  
  assert(line1.wkt() === line2.wkt(), 'WKT output identical');
  assert(JSON.stringify(line1.json()) === JSON.stringify(line2.json()), 'GeoJSON output identical');
});

// Test API completeness
test('All original API methods work', () => {
  const arc = require('../dist/index.js');
  
  // Test Coord class
  const coord = new arc.Coord(-122, 48);
  assert(coord.lon === -122, 'Coord longitude works');
  assert(coord.lat === 48, 'Coord latitude works');
  assert(coord.view(), 'Coord view() works');
  assert(coord.antipode(), 'Coord antipode() works');
  
  // Test GreatCircle class
  const gc = new arc.GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
  const line = gc.Arc(3);
  assert(line.wkt(), 'WKT output works');
  assert(line.json(), 'JSON output works');
  
  // Test utility functions
  assert(typeof arc.D2R === 'number', 'D2R constant exists');
  assert(typeof arc.R2D === 'number', 'R2D constant exists');
  assert(typeof arc.roundCoords === 'function', 'roundCoords function exists');
});

console.log('\n🎉 All build output tests passed!');
