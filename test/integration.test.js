'use strict';

var test = require('tape').test;
var arc = require('../');

// Complex real-world routes for integration testing
var routes = [
    [{x: -122, y: 48}, {x: -77, y:  39}, {'name': 'Seattle to DC'}],
    [{x: -122, y: 48}, {x: 0, y:  51}, {'name': 'Seattle to London'}],
    [{x: -75.9375, y: 35.460669951495305}, {x: 146.25, y: -43.06888777416961}, {'name': 'crosses dateline 1'}],
    [{x: 145.54687500000003, y: 48.45835188280866}, {x: -112.5, y: -37.71859032558814}, {'name': 'crosses dateline 2'}],
    [{x: -74.564208984375, y: -0.17578097424708533}, {x: 137.779541015625, y: -22.75592068148639}, {'name':'south 1'}],
    [{x: -66.829833984375, y: -18.81271785640776  }, {x: 118.795166015625, y: -20.797201434306984}, {'name':'south 2'}]
];

// Expected arc results for validation
var expectedArcs = [
  {"properties":{"name":"Seattle to DC"},"geometries":[{"coords":[[-122,48],[-97.728086,45.753682],[-77,39]],"length":3}]},
  {"properties":{"name":"Seattle to London"},"geometries":[{"coords":[[-122,48],[-64.165901,67.476242],[0,51]],"length":3}]},
  {"properties":{"name":"crosses dateline 1"},"geometries":[{"coords":[[-75.9375,35.46067],[-136.823034,-10.367409],[146.25,-43.068888]],"length":3}]},
  {"properties":{"name":"crosses dateline 2"},"geometries":[{"coords":[[145.546875,48.458352],[-157.284841,8.442054],[-112.500000,-37.718590]],"length":3}]},
  {"properties":{"name":"south 1"},"geometries":[{"coords":[[-74.564209,-0.175781],[-140.443271,-35.801086],[137.779541,-22.755921]],"length":3}]},
  {"properties":{"name":"south 2"},"geometries":[{"coords":[[-66.829834,-18.812718],[-146.781778,-82.179503],[118.795166,-20.797201]],"length":3}]}
];

// Expected WKT results
var expectedWkts = [
  'LINESTRING(-122 48,-97.728086 45.753682,-77 39)',
  'LINESTRING(-122 48,-64.165901 67.476242,0 51)',
  'LINESTRING(-75.9375 35.46067,-136.823034 -10.367409,146.25 -43.068888)',
  'LINESTRING(145.546875 48.458352,-157.284841 8.442054,-112.5 -37.71859)',
  'LINESTRING(-74.564209 -0.175781,-140.443271 -35.801086,137.779541 -22.755921)',
  'LINESTRING(-66.829834 -18.812718,-146.781778 -82.179503,118.795166 -20.797201)',
];

test('Integration: Complex routes with dateline crossing', function(t) {
    routes.forEach(function(route, idx) {
        var gc = new arc.GreatCircle(route[0], route[1], route[2]);
        var line = gc.Arc(3);
        
        // Test internal structure matches expected
        t.deepEqual(JSON.stringify(line), JSON.stringify(expectedArcs[idx]), 
            'Route ' + idx + ' (' + route[2].name + ') internal structure should match');
        
        // Test WKT output matches expected
        t.equal(line.wkt(), expectedWkts[idx], 
            'Route ' + idx + ' (' + route[2].name + ') WKT should match');
    });
    t.end();
});

test('Integration: GeoJSON output validation', function(t) {
    routes.forEach(function(route, idx) {
        var gc = new arc.GreatCircle(route[0], route[1], route[2]);
        var line = gc.Arc(3);
        var geojson = line.json();
        
        // Validate GeoJSON structure
        t.equal(geojson.type, 'Feature', 'Should be GeoJSON Feature');
        t.ok(geojson.geometry, 'Should have geometry');
        t.ok(geojson.properties, 'Should have properties');
        t.equal(geojson.properties.name, route[2].name, 'Properties should match input');
        
        // Validate coordinate structure
        if (geojson.geometry.type === 'LineString') {
            t.ok(Array.isArray(geojson.geometry.coordinates), 'LineString coordinates should be array');
            t.ok(geojson.geometry.coordinates.length > 0, 'Should have coordinate points');
        } else if (geojson.geometry.type === 'MultiLineString') {
            t.ok(Array.isArray(geojson.geometry.coordinates), 'MultiLineString coordinates should be array');
            t.ok(geojson.geometry.coordinates.length > 0, 'Should have line arrays');
        }
    });
    t.end();
});

test('Integration: Dateline crossing behavior', function(t) {
    // Test routes that cross the international dateline
    var datelineCrossing1 = routes[2]; // crosses dateline 1
    var datelineCrossing2 = routes[3]; // crosses dateline 2
    
    var gc1 = new arc.GreatCircle(datelineCrossing1[0], datelineCrossing1[1], datelineCrossing1[2]);
    var arc1 = gc1.Arc(3);
    
    var gc2 = new arc.GreatCircle(datelineCrossing2[0], datelineCrossing2[1], datelineCrossing2[2]);
    var arc2 = gc2.Arc(3);
    
    // Both should generate valid arcs
    t.ok(arc1.geometries.length > 0, 'Dateline crossing route 1 should generate geometry');
    t.ok(arc2.geometries.length > 0, 'Dateline crossing route 2 should generate geometry');
    
    // Should have coordinate data
    t.ok(arc1.geometries[0].coords.length > 0, 'Should have coordinate points');
    t.ok(arc2.geometries[0].coords.length > 0, 'Should have coordinate points');
    
    t.end();
});

test('Integration: Southern hemisphere routes', function(t) {
    var south1 = routes[4]; // south 1
    var south2 = routes[5]; // south 2
    
    var gc1 = new arc.GreatCircle(south1[0], south1[1], south1[2]);
    var arc1 = gc1.Arc(3);
    
    var gc2 = new arc.GreatCircle(south2[0], south2[1], south2[2]);
    var arc2 = gc2.Arc(3);
    
    // Both should generate valid arcs
    t.ok(arc1.geometries.length > 0, 'Southern route 1 should generate geometry');
    t.ok(arc2.geometries.length > 0, 'Southern route 2 should generate geometry');
    
    // Check that southern latitudes are preserved
    var coords1 = arc1.geometries[0].coords;
    var coords2 = arc2.geometries[0].coords;
    
    t.ok(coords1.some(coord => coord[1] < 0), 'Route 1 should have southern latitudes');
    t.ok(coords2.some(coord => coord[1] < 0), 'Route 2 should have southern latitudes');
    
    t.end();
});

test('Integration: Full workflow test', function(t) {
    // Test complete workflow: Coord -> GreatCircle -> Arc -> GeoJSON/WKT
    var startCoord = new arc.Coord(-122, 48);
    var endCoord = new arc.Coord(-77, 39);
    
    // Create GreatCircle from Coord objects
    var gc = new arc.GreatCircle(
        { x: startCoord.lon, y: startCoord.lat }, 
        { x: endCoord.lon, y: endCoord.lat },
        { name: 'Full workflow test', source: 'integration test' }
    );
    
    // Generate arc with custom point count
    var generatedArc = gc.Arc(5);
    
    // Validate all outputs
    t.ok(generatedArc instanceof arc.Arc, 'Should generate Arc instance');
    t.equal(generatedArc.properties.name, 'Full workflow test', 'Properties should be preserved');
    
    var geojson = generatedArc.json();
    var wkt = generatedArc.wkt();
    
    t.equal(geojson.type, 'Feature', 'GeoJSON should be valid');
    t.ok(typeof wkt === 'string' && wkt.length > 0, 'WKT should be valid string');
    t.ok(wkt.startsWith('LINESTRING('), 'WKT should be LINESTRING format');
    
    t.end();
});
