'use strict';

var test = require('tape').test;
var arc = require('../dist');

test('GreatCircle: Basic construction and interpolation', function(t) {
    var gc = new arc.GreatCircle({
        x: 0, y: 0
    }, {
        x: 10, y: 0
    });
    
    t.ok(gc, 'GreatCircle should be created');
    t.deepEqual(gc.interpolate(0), [0, 0], 'interpolate(0) should return start point');
    t.deepEqual(gc.interpolate(1), [10, 0], 'interpolate(1) should return end point');
    t.end();
});

test('GreatCircle: Constructor with properties', function(t) {
    var props = { name: 'Test Route', color: 'red' };
    var gc = new arc.GreatCircle(
        { x: -122, y: 48 }, 
        { x: -77, y: 39 }, 
        props
    );
    
    t.deepEqual(gc.properties, props, 'properties should be set');
    t.end();
});

test('GreatCircle: Interpolation at midpoint', function(t) {
    var gc = new arc.GreatCircle(
        { x: -122, y: 48 }, 
        { x: -77, y: 39 }
    );
    
    var midpoint = gc.interpolate(0.5);
    t.equal(midpoint.length, 2, 'midpoint should be coordinate pair');
    t.equal(typeof midpoint[0], 'number', 'longitude should be number');
    t.equal(typeof midpoint[1], 'number', 'latitude should be number');
    
    // Midpoint should be between start and end
    t.ok(midpoint[0] > -122 && midpoint[0] < -77, 'longitude should be between start and end');
    t.ok(midpoint[1] > 39 && midpoint[1] < 48, 'latitude should be between start and end');
    t.end();
});

test('GreatCircle: Arc generation', function(t) {
    var gc = new arc.GreatCircle(
        { x: -122, y: 48 }, 
        { x: -77, y: 39 }
    );
    
    var generatedArc = gc.Arc(3);
    t.ok(generatedArc instanceof arc.Arc, 'Arc() should return Arc instance');
    t.ok(generatedArc.geometries.length > 0, 'Arc should have geometries');
    
    var json = generatedArc.json();
    t.equal(json.type, 'Feature', 'Arc JSON should be GeoJSON Feature');
    t.ok(json.geometry.coordinates.length > 0, 'should have coordinate data');
    t.end();
});

test('GreatCircleException: Antipodal points', function(t) {
    try {
        new arc.GreatCircle({
            x: 1, y: 1
        }, {
            x: -179, y: -1
        });
        t.fail('Should throw error for antipodal points');
    }
    catch (e) {
        t.equal(e.toString(), "Error: it appears 1,1 and -179,-1 are 'antipodal', e.g diametrically opposite, thus " +
            "there is no single route but rather infinite", "Antipodal error test");
    }
    t.end();
});

test('GreatCircle: Input validation', function(t) {
    // Test missing coordinates
    try {
        new arc.GreatCircle(null, { x: 0, y: 0 });
        t.fail('Should throw error for null start point');
    } catch (e) {
        t.ok(e.message.includes('expects two args'), 'should validate start point');
    }
    
    try {
        new arc.GreatCircle({ x: 0, y: 0 }, null);
        t.fail('Should throw error for null end point');
    } catch (e) {
        t.ok(e.message.includes('expects two args'), 'should validate end point');
    }
    
    t.end();
});
