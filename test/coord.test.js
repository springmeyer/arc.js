'use strict';

var test = require('tape').test;
var arc = require('../');

test('Coord: Basic properties', function(t) {
    var coord = new arc.Coord(0, 0);
    t.equal(coord.lon, 0, 'longitude should be 0');
    t.equal(coord.lat, 0, 'latitude should be 0');
    t.equal(coord.x, 0, 'x (radians) should be 0');
    t.equal(coord.y, 0, 'y (radians) should be 0');
    t.end();
});

test('Coord: view() method', function(t) {
    var coord = new arc.Coord(0, 0);
    t.equal(coord.view(), '0,0', 'view() should return formatted string');
    
    var coord2 = new arc.Coord(-122.4194, 37.7749);
    t.equal(coord2.view(), '-122,37.7', 'view() should format coordinates');
    t.end();
});

test('Coord: antipode() method', function(t) {
    var coord = new arc.Coord(0, 0);
    var antipode = coord.antipode();
    t.equal(antipode.view(), '-180,0', 'antipode of (0,0) should be (-180,0)');
    
    var coord2 = new arc.Coord(-122, 37);
    var antipode2 = coord2.antipode();
    t.equal(antipode2.lon, 58, 'antipode longitude calculation');
    t.equal(antipode2.lat, -37, 'antipode latitude calculation');
    t.end();
});

test('Coord: Edge cases', function(t) {
    // Test extreme coordinates
    var northPole = new arc.Coord(0, 90);
    var southPole = new arc.Coord(0, -90);
    var dateline = new arc.Coord(180, 0);
    
    t.equal(northPole.lat, 90, 'North pole latitude');
    t.equal(southPole.lat, -90, 'South pole latitude');
    t.equal(dateline.lon, 180, 'Dateline longitude');
    
    t.end();
});
