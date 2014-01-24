var arc = require('../');
var assert = require('assert');

describe('Arc.js', function() {
    it('should be able to create an arc.Coord', function() {
        var coord = new arc.Coord(0,0);
        assert.equal(coord.lon,0);
        assert.equal(coord.lat,0);
        assert.equal(coord.x,0);
        assert.equal(coord.y,0);
    });

});
