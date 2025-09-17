'use strict';

var test = require('tape').test;
var arc = require('../dist');

test('Arc: Empty arc initialization', function(t) {
    var a = new arc.Arc();
    t.deepEqual(a.properties, {}, 'properties should be empty object');
    t.equal(a.wkt(), '', 'empty arc WKT should be empty string');
    t.deepEqual(a.json(), {
        'geometry': { 'type': 'LineString', 'coordinates': null },
        'type': 'Feature', 
        'properties': {}
    }, 'empty arc JSON should have null coordinates');
    t.end();
});

test('Arc: Arc with properties', function(t) {
    var props = { name: 'test-arc', color: 'blue' };
    var a = new arc.Arc(props);
    t.deepEqual(a.properties, props, 'properties should be set correctly');
    
    var json = a.json();
    t.deepEqual(json.properties, props, 'JSON output should include properties');
    t.end();
});

test('Arc: Property modification', function(t) {
    var a = new arc.Arc();
    a.properties.name = 'modified';
    a.properties.count = 42;
    
    t.equal(a.properties.name, 'modified', 'properties should be modifiable');
    t.equal(a.properties.count, 42, 'numeric properties should work');
    
    var json = a.json();
    t.equal(json.properties.name, 'modified', 'modified properties in JSON');
    t.equal(json.properties.count, 42, 'numeric properties in JSON');
    t.end();
});

test('Arc: GeoJSON structure validation', function(t) {
    var a = new arc.Arc({ test: 'value' });
    var json = a.json();
    
    t.equal(json.type, 'Feature', 'should be GeoJSON Feature');
    t.ok(json.geometry, 'should have geometry');
    t.equal(json.geometry.type, 'LineString', 'geometry should be LineString for empty arc');
    t.ok(json.properties, 'should have properties');
    t.end();
});
