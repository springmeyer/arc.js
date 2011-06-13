# arc.js

Calculate great circles routes.

Algorithms from http://williams.best.vwh.net/avform.htm#Intermediate


# Installation

For NodeJS usage, install with npm:

    npm install -g


# Usage

The idea is you might have one or many start and end points.

Create Coordinate pairs from the longitude (x) and latitude (y) values
of each place and pass these (and optionally a name), to the GreatCircle
constructor:
 
    var arc = require('arc');
    var start = new arc.Coord(-122, 48);
    var end = new arc.Coord(-77, 39);
    var gc = new arc.GreatCircle(start, end, "Seattle to DC");
    var line = gc.Arc(6);

Then `line` will be a raw sequence of the start and end coordinates plus an arc of
intermediate coordinate pairs.

    > line
    { name: 'Seattle to DC',
      coords: 
       [ [ -122, 48.00000000000001 ],
         [ -112.06161978373486, 47.7241672604096 ],
         [ -102.38404317022653, 46.60813199882492 ],
         [ -93.22718895342909, 44.716217302635705 ],
         [ -84.74823988299501, 42.14415510795357 ],
         [ -77, 38.99999999999999 ] ],
      length: 6 }

You can then serialize to a GeoJSON geometry format:

    > line.json();
    { geometry: 
       { type: 'LineString',
         coordinates: [ [Object], [Object], [Object], [Object], [Object], [Object] ] },
      type: 'Feature',
      properties: { name: 'Seattle to DC' } }
    
Or to WKT (Well known text):

    > line.wkt();
    'LINESTRING(-122 48.00000000000001,-112.06161978373486 47.7241672604096,-102.38404317022653 46.60813199882492,-93.22718895342909 44.716217302635705,-84.74823988299501 42.14415510795357,-77 38.99999999999999)'
    
It is then up to you to add up these geometries to create fully fledged geodata. See the examples/ directory
for sample code to create full a GeoJSON file from multiple routes.

