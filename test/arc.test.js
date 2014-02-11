'use strict';

var arc = require('../');
var assert = require('assert');

describe('Coord', function() {
    it('#constructor', function() {
        var coord = new arc.Coord(0,0);
        assert.equal(coord.lon,0);
        assert.equal(coord.lat,0);
        assert.equal(coord.x,0);
        assert.equal(coord.y,0);
    });
    it('#view', function() {
        var coord = new arc.Coord(0,0);
        assert.equal(coord.view(),'0,0');
    });
    it('#antipode', function() {
        var coord = new arc.Coord(0,0);
        assert.equal(coord.antipode().view(),'-180,0');
    });
});

describe('Arc', function() {
    it('#constructor', function() {
        var a = new arc.Arc();
        assert.deepEqual(a.properties, {});
    });
    it('#wkt', function() {
        var a = new arc.Arc();
        assert.equal(a.wkt(), '');
    });
    it('#json', function() {
        var a = new arc.Arc();
        assert.deepEqual(a.json(),{
            'geometry': { 'type': 'LineString', 'coordinates': null },
            'type': 'Feature', 'properties': {}
        });
    });
});

describe('GreatCircle', function() {
    it('#constructor', function() {
        var a = new arc.GreatCircle({
            x: 0, y: 0
        }, {
            x: 10, y: 0
        });
        assert.ok(a);
    });
    it('#interpolate', function() {
        var a = new arc.GreatCircle({
            x: 0, y: 0
        }, {
            x: 10, y: 0
        });
        assert.deepEqual(a.interpolate(0), [0, 0]);
        assert.deepEqual(a.interpolate(1), [10, 0]);
    });
});

var routes = [
    [{x: -122, y: 48}, {x: -77, y:  39}, {'name': 'Seattle to DC'}],
    [{x: -122, y: 48}, {x: 0, y:  51}, {'name': 'Seattle to London'}],
    [{x: -75.9375, y: 35.460669951495305}, {x: 146.25, y: -43.06888777416961}, {'name': 'crosses dateline 1'}],
    [{x: 145.54687500000003, y: 48.45835188280866}, {x: -112.5, y: -37.71859032558814}, {'name': 'crosses dateline 2'}],
    [{x: -74.564208984375, y: -0.17578097424708533}, {x: 137.779541015625, y: -22.75592068148639}, {'name':'south 1'}],
    [{x: -66.829833984375, y: -18.81271785640776  }, {x: 118.795166015625, y: -20.797201434306984}, {'name':'south 2'}]
];
// trouble: needs work
//{ x: 114.576416015625, y:-44.21370990970204},{x: -65.423583984375, y:-43.19716728250127}

var arcs = [
  {"properties":{"name":"Seattle to DC"},"geometries":[{"coords":[[-122,48.00000000000001],[-97.72808611752785,45.75368189927002],[-77,38.99999999999999]],"length":3}]},
  {"properties":{"name":"Seattle to London"},"geometries":[{"coords":[[-122,48.00000000000001],[-64.16590091973099,67.47624207149578],[0,51]],"length":3}]},
  {"properties":{"name":"crosses dateline 1"},"geometries":[{"coords":[[-75.9375,35.46066995149531],[-136.82303405489677,-10.367409282634164],[146.25,-43.06888777416961]],"length":3}]},
  {"properties":{"name":"crosses dateline 2"},"geometries":[{"coords":[[145.54687500000003,48.45835188280866],[-157.28484118689477,8.44205355944752],[-112.5,-37.71859032558814]],"length":3}]},
  {"properties":{"name":"south 1"},"geometries":[{"coords":[[-74.564208984375,-0.17578097424708533],[-140.44327137076033,-35.80108605508993],[137.779541015625,-22.755920681486387]],"length":3}]},
  {"properties":{"name":"south 2"},"geometries":[{"coords":[[-66.829833984375,-18.812717856407765],[-146.78177837397814,-82.1795027896656],[118.795166015625,-20.79720143430698]],"length":3}]}
];


describe('Routes', function() {
    routes.forEach(function(route,idx) {
       it(route[2].name, function() {
            var gc = new arc.GreatCircle(route[0], route[1], route[2]);
            var line = gc.Arc(3);
            //console.log(JSON.stringify(line))
            assert.deepEqual(line,arcs[idx]);
       });
    });
});


