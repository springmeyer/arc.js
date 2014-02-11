#!/usr/bin/env node

var arc = require('./arc.js');

var features = [];
var geojson = { 'type': 'FeatureCollection',
                'features': features
              };

var routes = [
    [{x: -122, y: 48}, {x: -77, y:  39}, {'name': 'Seattle to DC'}],
    [{x: -122, y: 48}, {x: 0, y:  51}, {'name': 'Seattle to London'}],
    [{x: -75.9375, y: 35.460669951495305}, {x: 146.25, y: -43.06888777416961}, {'name': 'crosses dateline'}],
    [{x: 145.54687500000003, y: 48.45835188280866}, {x: -112.5, y: -37.71859032558814}, {'name': 'crosses dateline'}]
  ];

routes.forEach(function(route,idx) {
    var gc = new arc.GreatCircle(route[0], route[1], route[2]);
    var line = gc.Arc(50);
    features.push(line.json());
});

console.log(JSON.stringify(geojson));
