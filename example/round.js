// Round GeoJSON lines file.

var fs = require('fs'),
    arc = require('../arc');

var geojson = JSON.parse(fs.readFileSync(__dirname + '/tracks.geojson', 'utf-8'));

var tolerance = 1;

for (var i = 0; i < geojson.features.length; i++) {
    if (geojson.features[i].geometry.type == 'LineString') {
        for (var j = 0; j < geojson.features[i].geometry.coordinates.length - 1; j++) {
            var a = geojson.features[i].geometry.coordinates[j],
                b = geojson.features[i].geometry.coordinates[j + 1];
            var dist = Math.sqrt(
                Math.abs(a[0] - b[0]) *
                Math.abs(a[1] - b[1]));
            if (dist > tolerance) {
                var gc = new arc.GreatCircle(
                    { x: a[0], y: a[1] },
                    { x: b[0], y: b[1] });
                var line = gc.Arc(10);
                geojson.features[i].geometry.coordinates[j].arc = line.coords;
            }
        }
        var co = [];
        for (var k = geojson.features[i].geometry.coordinates.length - 1; k >= 0; k--) {
            if (geojson.features[i].geometry.coordinates[k].arc) {
                co = geojson.features[i].geometry.coordinates[k].arc.concat(co);
            } else {
                co.unshift(geojson.features[i].geometry.coordinates[k]);
            }
        }
        geojson.features[i].geometry.coordinates = co;
    }
}

console.log(JSON.stringify(geojson));
