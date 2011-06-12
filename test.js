#!/usr/bin/env node

var arc = require('./arc.js');

var seattle = new arc.Coord(-122, 48);
var dc = new arc.Coord(-77, 39);
var gc = new arc.GreatCircle(seattle, dc);
var options = {endpoints: false, mercator: false};
var route = gc.geoJSON(50, options);
console.log(JSON.stringify(route));

// antipode should throw!
/*
var seattle = new arc.Coord(-122, 48);
var gc = new arc.GreatCircle(seattle, seattle.antipode());
*/