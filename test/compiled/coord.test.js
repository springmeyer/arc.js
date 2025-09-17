"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tape_1 = __importDefault(require("tape"));
var index_1 = require("../dist/index");
(0, tape_1.default)('Coord: Basic properties', function (t) {
    var coord = new index_1.Coord(0, 0);
    t.equal(coord.lon, 0, 'longitude should be 0');
    t.equal(coord.lat, 0, 'latitude should be 0');
    t.equal(coord.x, 0, 'x (radians) should be 0');
    t.equal(coord.y, 0, 'y (radians) should be 0');
    t.end();
});
(0, tape_1.default)('Coord: view() method', function (t) {
    var coord = new index_1.Coord(0, 0);
    t.equal(coord.view(), '0,0', 'view() should return formatted string');
    var coord2 = new index_1.Coord(-122.4194, 37.7749);
    t.equal(coord2.view(), '-122,37.7', 'view() should format coordinates');
    t.end();
});
(0, tape_1.default)('Coord: antipode() method', function (t) {
    var coord = new index_1.Coord(0, 0);
    var antipode = coord.antipode();
    t.equal(antipode.view(), '-180,0', 'antipode of (0,0) should be (-180,0)');
    var coord2 = new index_1.Coord(-122, 37);
    var antipode2 = coord2.antipode();
    t.equal(antipode2.lon, 58, 'antipode longitude calculation');
    t.equal(antipode2.lat, -37, 'antipode latitude calculation');
    t.end();
});
(0, tape_1.default)('Coord: Edge cases', function (t) {
    // Test extreme coordinates
    var northPole = new index_1.Coord(0, 90);
    var southPole = new index_1.Coord(0, -90);
    var dateline = new index_1.Coord(180, 0);
    t.equal(northPole.lat, 90, 'North pole latitude');
    t.equal(southPole.lat, -90, 'South pole latitude');
    t.equal(dateline.lon, 180, 'Dateline longitude');
    t.end();
});
(0, tape_1.default)('Coord: Type safety validation', function (t) {
    var coord = new index_1.Coord(-122.4194, 37.7749);
    // TypeScript should enforce these are numbers
    var lon = coord.lon;
    var lat = coord.lat;
    var x = coord.x;
    var y = coord.y;
    t.equal(typeof lon, 'number', 'lon should be typed as number');
    t.equal(typeof lat, 'number', 'lat should be typed as number');
    t.equal(typeof x, 'number', 'x should be typed as number');
    t.equal(typeof y, 'number', 'y should be typed as number');
    // Methods should return correct types
    var view = coord.view();
    var antipode = coord.antipode();
    t.equal(typeof view, 'string', 'view() should return string');
    t.ok(antipode instanceof index_1.Coord, 'antipode() should return Coord instance');
    t.end();
});
