#!/usr/bin/env node

var arc = require('./arc.js');

var features = [];
var geojson = { 'type': 'FeatureCollection',
                'features': features
              };

var routes  = [
    [ new arc.Coord(-122, 48), new arc.Coord(-77, 39) ], // seattle to dc  
    [ new arc.Coord(-122, 48), new arc.Coord(0, 51) ], // seattle to london  
  ];

routes.forEach(function(route,idx) {
    var gc = new arc.GreatCircle(route[0],route[1]);
    var line = gc.Arc(50);
    features.push(line.json());
});

console.log(JSON.stringify(geojson));
