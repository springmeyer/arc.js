#!/usr/bin/env node

var arc = require('./arc.js');

var features = [];
var geojson = { 'type': 'FeatureCollection',
                'features': features
              };

var routes = [
    [new arc.Coord(-122, 48), new arc.Coord(-77, 39), {'name': 'Seattle to DC'}],
    [new arc.Coord(-122, 48), new arc.Coord(0, 51), {'name': 'Seattle to London'}],
    [new arc.Coord(-75.9375,35.460669951495305), new arc.Coord(146.25,-43.06888777416961), {'name': 'crosses dateline'}],
    [new arc.Coord(145.54687500000003,48.45835188280866 ), new arc.Coord(-112.5,-37.71859032558814), {'name': 'crosses dateline'}]
  ];

routes.forEach(function(route,idx) {
    var gc = new arc.GreatCircle(route[0], route[1], route[2]);
    var line = gc.Arc(50);
    features.push(line.json());
});

console.log(JSON.stringify(geojson));
