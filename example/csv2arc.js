#!/usr/bin/env node

var arc = require('arc');
var fs = require('fs');
var path = require('path');

var features = [];
var geojson = { 'type': 'FeatureCollection',
                'features': features
              };

fs.readFile(path.join(__dirname,'routes.csv'), function(err, data) {
    if (err) throw err;
    csv = data.toString();
    var lines = csv.split('\n');
    var headers = lines[0].split(',');
    delete lines[0];
    lines.forEach(function(element,idx) {
        var parts = element.split(',');
        var start = new arc.Coord(parseFloat(parts[0].trim()), parseFloat(parts[1].trim()));
        var end = new arc.Coord(parseFloat(parts[2].trim()), parseFloat(parts[3].trim()));
        var gc = new arc.GreatCircle(start, end, parts[4].trim());
        var line = gc.Arc(50);
        features.push(line.json());
    });
    console.log(JSON.stringify(geojson));
});



