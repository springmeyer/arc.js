'use strict';

var test = require('tape').test;
var arc = require('../');

test('Coord', function(t) {
    var coord = new arc.Coord(0,0);
    t.equal(coord.lon,0);
    t.equal(coord.lat,0);
    t.equal(coord.x,0);
    t.equal(coord.y,0);
    t.equal(coord.view(),'0,0');
    t.equal(coord.antipode().view(),'-180,0');
    t.end();
});

test('Arc', function(t) {
    var a = new arc.Arc();
    t.deepEqual(a.properties, {});
    t.equal(a.wkt(), '');
    t.deepEqual(a.json(),{
        'geometry': { 'type': 'LineString', 'coordinates': null },
        'type': 'Feature', 'properties': {}
    });
    t.end();
});

test('GreatCircle', function(t) {
    var a = new arc.GreatCircle({
        x: 0, y: 0
    }, {
        x: 10, y: 0
    });
    t.ok(a);
    t.deepEqual(a.interpolate(0), [0, 0]);
    t.deepEqual(a.interpolate(1), [10, 0]);
    t.end();
});

test('GreatCircleException', function(t) {
    try {
        new arc.GreatCircle({
            x: 1, y: 1
        }, {
            x: -179, y: -1
        });
    }
    catch (e) {
        t.equal(e.toString(), "Error: it appears 1,1 and -179,-1 are 'antipodal', e.g diametrically opposite, thus " +
            "there is no single route but rather infinite" , "Antipodal error test");
    }
    t.end();
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
  {"properties":{"name":"Seattle to DC"},"geometries":[{"coords":[[-122,48],[-97.728086,45.753681],[-77,38.999999]],"length":3}]},
  {"properties":{"name":"Seattle to London"},"geometries":[{"coords":[[-122,48],[-64.165900,67.476242],[0,50.999999]],"length":3}]},
  {"properties":{"name":"crosses dateline 1"},"geometries":[{"coords":[[-75.9375,35.460669],[-136.823034,-10.367409],[146.25,-43.068887]],"length":3}]},
  {"properties":{"name":"crosses dateline 2"},"geometries":[{"coords":[[145.546875,48.458351],[-157.284841,8.442053],[-112.500000,-37.718590]],"length":3}]},
  {"properties":{"name":"south 1"},"geometries":[{"coords":[[-74.564208,-0.175780],[-140.443271,-35.801086],[137.779541,-22.755920]],"length":3}]},
  {"properties":{"name":"south 2"},"geometries":[{"coords":[[-66.829833,-18.812717],[-146.781778,-82.179502],[118.795166,-20.797201]],"length":3}]}
];


test('Routes', function(t) {
    routes.forEach(function(route,idx) {
        var gc = new arc.GreatCircle(route[0], route[1], route[2]);
        var line = gc.Arc(3);
        t.deepEqual(JSON.stringify(line), JSON.stringify(arcs[idx]));
    });
    t.end();
});


