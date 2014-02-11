# arc.js

Calculate great circles routes.

Algorithms from http://williams.best.vwh.net/avform.htm#Intermediate


# Installation

For NodeJS usage, install with npm:

    npm install -g


# Usage

Require the library in node.js like:

    var arc = require('arc');

Use in the browser like:

    <script src="./arc.js"></script>

The API works like so:

**1)** Create start and end coordinates

First we need to declare where the arc should start and end

    var start = new arc.Coord(-122, 48);
    var end = new arc.Coord(-77, 39);

These are `[lon,lat]` pairs like GeoJSON. Be aware that Leaflet uses `[lat,lon]` order [currently](https://github.com/Leaflet/Leaflet/issues/1455).

**2)** Create GreatCircle object

Next we pass the start/end to the `GreatCircle` constructor, along with an optional object representing the properties for this future line.

    var gc = new arc.GreatCircle(start, end, {'name': 'Seattle to DC'});

**3)** Generate a line

Then call the `Arc` function to generate a line:

    var npoints = 6;
    var options = {offset:10}
    var line = gc.Arc(npoints,options);

The `npoints` argument specifies the number of intermediate vertices you want in the resulting line. The higher the number the more dense and accurate the line will be.

The `offset` option controls the likelyhood that lines which cross the dateline will be split. The higher the number the more likely. For lines that cross and dateline and are near the poles and number as high as 180 might be needed for splitting to be triggered. It is unclear to me (@springmeyer) what the drawbacks are of high offsets - the default is 10 if you do not specify a value - this default comes from the OGR port.

Then `line` will be a raw sequence of the start and end coordinates plus an arc of
intermediate coordinate pairs.

    > line
    { properties: { name: 'Seattle to DC' },
      coords: 
       [ [ -122, 48.00000000000001 ],
         [ -112.06161978373486, 47.7241672604096 ],
         [ -102.38404317022653, 46.60813199882492 ],
         [ -93.22718895342909, 44.716217302635705 ],
         [ -84.74823988299501, 42.14415510795357 ],
         [ -77, 38.99999999999999 ] ],
      length: 6 }

You can then serialize to a GeoJSON geometry:

    > line.json();
    { geometry: 
       { type: 'LineString',
         coordinates: [ [Object], [Object], [Object], [Object], [Object], [Object] ] },
      type: 'Feature',
      properties: { name: 'Seattle to DC' } }
    

Or to WKT (Well known text):

    > line.wkt();
    'LINESTRING(-122 48.00000000000001,-112.06161978373486 47.7241672604096,-102.38404317022653 46.60813199882492,-93.22718895342909 44.716217302635705,-84.74823988299501 42.14415510795357,-77 38.99999999999999)'
    

It is then up to you to add up these features to create fully fledged geodata. See the examples/ directory for sample code to create GeoJSON feature collection from multiple routes.
