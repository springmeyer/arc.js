#!/usr/bin/env node

var arc = require('./arc.js');

var seattle = new arc.Coord(-122, 48);
var dc = new arc.Coord(-77, 39);
var gc = new arc.GreatCircle(seattle, dc);
var options = {endpoints: false, mercator: false};
console.log(JSON.stringify(gc.geoJSON(50, options)));
