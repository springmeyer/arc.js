# arc.js
> Calculate great circle routes as lines in GeoJSON or WKT format.

[**Try the interactive demo**](https://danespringmeyer.com/arc.js/) - Click to plot great circle arcs on a map!

Algorithms from [Ed Williams' Aviation Formulary](https://edwilliams.org/avform.htm#Intermediate)

Includes basic support for splitting lines that cross the dateline, based on
a partial port of code from GDAL's OGR library.

## Install

```bash
$ npm install --save arc
```

## Usage

### Node.js (CommonJS)
For Node.js projects using CommonJS modules:
```js
var arc = require('arc');
var gc = new arc.GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
```

### Node.js (ES Modules)
For Node.js projects using ES modules:
```js
import * as arc from 'arc';
const gc = new arc.GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
```

### TypeScript
Full TypeScript support with type definitions:
```typescript
import { GreatCircle, Coord, Arc, CoordinatePoint } from 'arc';

const start: CoordinatePoint = { x: -122, y: 48 };
const end: CoordinatePoint = { x: -77, y: 39 };
const gc = new GreatCircle(start, end);
```

### Browser
For direct browser usage (creates global `arc` object):
```html
<script src="./arc.js"></script>
<script>
  var gc = new arc.GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
</script>
```

### Bundlers (Webpack, Rollup, etc.)
Works with all modern bundlers:
```js
import { GreatCircle } from 'arc';
// or
const { GreatCircle } = require('arc');
```

## API

### JavaScript Examples

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
var line = generator.Arc(100, {offset: 10});
```

### TypeScript Examples

**1)** Import types and create coordinates

```typescript
import { GreatCircle, CoordinatePoint, ArcOptions } from 'arc';

const start: CoordinatePoint = { x: -122, y: 48 };
const end: CoordinatePoint = { x: -77, y: 39 };
```

**2)** Create GreatCircle with typed properties

```typescript
interface RouteProperties {
  name: string;
  color?: string;
  distance?: number;
}

const properties: RouteProperties = { name: 'Seattle to DC', color: 'blue' };
const generator = new GreatCircle(start, end, properties);
```

**3)** Generate arc with typed options

```typescript
const options: ArcOptions = { offset: 10 };
const line = generator.Arc(100, options);

// TypeScript knows the return type is Arc
const geojson = line.json(); // Returns GeoJSONFeature
const wkt = line.wkt();      // Returns string
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

The second argument is an optional object to declare options. The `offset` option controls the likelyhood that lines will be split which cross the dateline. The higher the number the more likely. The default value is 10, which means lines within 10 degress of the dateline will be split. For lines that cross and dateline and are also near the poles you will likely need a higher value to trigger splitting. It is unclear to me (@springmeyer) what the drawbacks are of high offsets. I simply ported the code from GDAL's OGR library (`gdal/ogr/ogrgeometryfactory.cpp`) and have not taken the time to fully comprehend how it works.

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

## TypeScript

```typescript
import { GreatCircle, CoordinatePoint } from 'arc';

const start: CoordinatePoint = { x: -122, y: 48 };
const end: CoordinatePoint = { x: -77, y: 39 };
const gc = new GreatCircle(start, end);
```

Available types: `CoordinatePoint`, `ArcOptions`, `Coord`, `GreatCircle`, `Arc`, `GeoJSONFeature`
```

It is then up to you to add up these features to create fully fledged geodata. See the [interactive demo](https://danespringmeyer.com/arc.js/) for sample code to create a GeoJSON feature collection from multiple routes.

## License

This project is licensed under the BSD license. See [LICENSE.md](LICENSE.md) for details.

### Third-Party Licenses

This project includes code ported from GDAL (Geospatial Data Abstraction Library), which is licensed under the MIT/X11 license. See [GDAL-LICENSE.md](GDAL-LICENSE.md) for the full GDAL license text and attribution details.
