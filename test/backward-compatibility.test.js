const test = require('tape');

// Test all backward compatibility scenarios

test('CommonJS require() works', (t) => {
  const arc = require('../dist/index.js');
  
  t.ok(arc.GreatCircle, 'GreatCircle class exists');
  t.ok(arc.Coord, 'Coord class exists');
  t.ok(arc.Arc, 'Arc class exists');
  t.equal(typeof arc.GreatCircle, 'function', 'GreatCircle is a function');
  
  // Test README example
  const start = { x: -122, y: 48 };
  const end = { x: -77, y: 39 };
  const generator = new arc.GreatCircle(start, end, {'name': 'Seattle to DC'});
  const line = generator.Arc(100, {offset: 10});
  
  t.ok(line, 'Arc generation works');
  t.equal(line.properties.name, 'Seattle to DC', 'Properties preserved');
  t.equal(line.json().type, 'Feature', 'Returns GeoJSON Feature');
  
  t.end();
});

test('Browser bundle (arc.js) works', (t) => {
  const arc = require('../arc.js');
  
  t.ok(arc.GreatCircle, 'GreatCircle class exists in bundle');
  t.ok(arc.Coord, 'Coord class exists in bundle');
  t.ok(arc.Arc, 'Arc class exists in bundle');
  
  // Test same functionality as package
  const start = { x: -122, y: 48 };
  const end = { x: -77, y: 39 };
  const generator = new arc.GreatCircle(start, end, {'name': 'Bundle Test'});
  const line = generator.Arc(3);
  
  t.ok(line, 'Bundle Arc generation works');
  t.equal(line.properties.name, 'Bundle Test', 'Bundle properties preserved');
  t.equal(line.json().type, 'Feature', 'Bundle returns GeoJSON Feature');
  
  t.end();
});

test('Output consistency between package and bundle', (t) => {
  const arcPackage = require('../dist/index.js');
  const arcBundle = require('../arc.js');
  
  const start = { x: -122, y: 48 };
  const end = { x: -77, y: 39 };
  
  const gc1 = new arcPackage.GreatCircle(start, end);
  const gc2 = new arcBundle.GreatCircle(start, end);
  
  const line1 = gc1.Arc(5);
  const line2 = gc2.Arc(5);
  
  t.equal(line1.wkt(), line2.wkt(), 'WKT output identical');
  t.deepEqual(line1.json(), line2.json(), 'GeoJSON output identical');
  
  t.end();
});

test('All original API methods work', (t) => {
  const arc = require('../dist/index.js');
  
  // Test Coord class
  const coord = new arc.Coord(-122, 48);
  t.equal(coord.lon, -122, 'Coord longitude works');
  t.equal(coord.lat, 48, 'Coord latitude works');
  t.ok(coord.view(), 'Coord view() works');
  t.ok(coord.antipode(), 'Coord antipode() works');
  
  // Test GreatCircle class
  const gc = new arc.GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
  const line = gc.Arc(3);
  t.ok(line.wkt(), 'WKT output works');
  t.ok(line.json(), 'JSON output works');
  
  // Test utility functions
  t.equal(typeof arc.D2R, 'number', 'D2R constant exists');
  t.equal(typeof arc.R2D, 'number', 'R2D constant exists');
  t.equal(typeof arc.roundCoords, 'function', 'roundCoords function exists');
  
  t.end();
});
