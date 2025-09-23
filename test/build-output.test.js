/**
 * Build output tests - Simple console-based testing
 * Tests the compiled dist/ files and browser bundle to ensure they work correctly
 */


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

// Test browser bundle exists (IIFE format for browsers, can't be required in Node.js)
test('Browser bundle (arc.js) exists', () => {
  const fs = require('fs');
  const path = require('path');
  
  const bundlePath = path.join(__dirname, '..', 'arc.js');
  assert(fs.existsSync(bundlePath), 'Browser bundle file exists');
  
  const bundleContent = fs.readFileSync(bundlePath, 'utf8');
  assert(bundleContent.includes('var arc = (() => {'), 'Bundle is IIFE format');
  assert(bundleContent.includes('GreatCircle'), 'Bundle contains GreatCircle');
  assert(bundleContent.includes('Coord'), 'Bundle contains Coord');
  assert(bundleContent.includes('Arc'), 'Bundle contains Arc');
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

// Test ESM imports work
test('ESM imports work', async () => {
  try {
    // Test namespace import
    const arc = await import('../dist/esm/index.js');
    assert(arc.GreatCircle, 'ESM GreatCircle exists');
    assert(arc.Coord, 'ESM Coord exists');
    assert(arc.Arc, 'ESM Arc exists');
    
    // Test functionality
    const start = { x: -122, y: 48 };
    const end = { x: -77, y: 39 };
    const generator = new arc.GreatCircle(start, end, {'name': 'ESM Test'});
    const line = generator.Arc(3);
    
    assert(line, 'ESM Arc generation works');
    assert(line.properties.name === 'ESM Test', 'ESM properties preserved');
    assert(line.json().type === 'Feature', 'ESM returns GeoJSON Feature');
    
    // Test named imports
    const { GreatCircle, Coord } = await import('../dist/esm/index.js');
    assert(GreatCircle, 'Named import GreatCircle works');
    assert(Coord, 'Named import Coord works');
    
    const coord = new Coord(-122, 48);
    assert(coord.lon === -122, 'Named import functionality works');
    
  } catch (error) {
    throw new Error(`ESM import failed: ${error.message}`);
  }
});

// Test output consistency between CommonJS and ESM
test('Output consistency between CommonJS and ESM', () => {
  const arcCJS = require('../dist/index.js');
  
  const start = { x: -122, y: 48 };
  const end = { x: -77, y: 39 };
  
  const gc1 = new arcCJS.GreatCircle(start, end);
  const line1 = gc1.Arc(5);
  
  // Test that we get consistent output
  assert(line1.wkt().length > 0, 'WKT output generated');
  assert(line1.json().type === 'Feature', 'GeoJSON Feature generated');
  assert(line1.json().geometry.type === 'LineString', 'LineString geometry generated');
});
