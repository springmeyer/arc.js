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
