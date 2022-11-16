# arc.js
> Calculate great circles routes as lines in GeoJSON or WKT format.

Algorithms from https://edwilliams.org/avform.htm#Intermediate

Includes basic support for splitting lines that cross the dateline, based on
a partial port of code from OGR.

## Install

```bash
$ npm install --save arc
```

## License

BSD

## Usage

Require the library in node.js like:
```js
var arc = require('arc');
```

Use in the browser like:
```html
<script src="./arc.js"></script>
```

## API

**1)** Create start and end coordinates

First we need to declare where the arc should start and end

```js
var start = { x: -122, y: 48 };
var end = { x: -77, y: 39 };
```

Note that `x` here is longitude in degrees and `y` is latitude in degrees.

**2)** Create GreatCircle object

Next we pass the start/end to the `GreatCircle` constructor, along with an optional object representing the properties for this future line.

```js
var generator = new arc.GreatCircle(start, end, {'name': 'Seattle to DC'});
```

**3)** Generate a line arc

Then call the `Arc` function on the `GreatCircle` object to generate a line:

```js
var line = generator.Arc(100,{offset:10});
```

The `line` will be a raw sequence of the start and end coordinates plus an arc of
intermediate coordinate pairs.

```js
> line
{
  properties: { name: 'Seattle to DC' },
  geometries: [
    {
      coords:
       [ [ -122, 48 ],
         [ -112.06162, 47.724167 ],
         [ -102.384043, 46.608132 ],
         [ -93.227189, 44.716217 ],
         [ -84.74824, 42.144155 ],
         [ -77, 39 ] ],
      length: 6
    }
  ]
}
```

#### Arc options

The first argument to `Arc` specifies the number of intermediate vertices you want in the resulting line. The higher the number the more dense and accurate the line will be.

The second argument is an optional object to declare options. The `offset` option controls the likelyhood that lines will be split which cross the dateline. The higher the number the more likely. The default value is 10, which means lines within 10 degress of the dateline will be split. For lines that cross and dateline and are also near the poles you will likely need a higher value to trigger splitting. It is unclear to me (@springmeyer) what the drawbacks are of high offsets. I simply ported the code from OGR's `gdal/ogr/ogrgeometryfactory.cpp` and have not taken the time to fully comprehend how it works.

**4)** Convert line to GeoJSON geometry

To serialize to a GeoJSON geometry:

```js
> line.json();
{ geometry:
   { type: 'LineString',
     coordinates: [ [Object], [Object], [Object], [Object], [Object], [Object] ] },
  type: 'Feature',
  properties: { name: 'Seattle to DC' } }
```

Or to WKT (Well known text):

```js
> line.wkt();
'LINESTRING(-122 48,-112.061619 47.724167,-102.384043 46.608131,-93.227188 44.716217,-84.748239 42.144155,-77 38.999999)'
```

It is then up to you to add up these features to create fully fledged geodata. See the examples/ directory for sample code to create a GeoJSON feature collection from multiple routes.
