# arc.js

Calculate great circle routes as lines in GeoJSON or WKT format.

[**🌍 Try the interactive demo**](https://danespringmeyer.com/arc.js/) - Click to plot great circle arcs on a map!

**Features:**
- Full TypeScript support with type definitions
- Works in Node.js (CommonJS & ES modules) and browsers
- Generates GeoJSON and WKT output formats
- Handles dateline crossing automatically
- Based on [Ed Williams' Aviation Formulary](https://edwilliams.org/avform.htm#Intermediate) algorithms and the GDAL source code

## Installation

```bash
npm install arc
```

## Quick Start

### CommonJS (Node.js)
```js
const arc = require('arc');
const gc = new arc.GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
const line = gc.Arc(100);
console.log(line.json()); // GeoJSON output
```

### ES Modules (Node.js, bundlers)
```js
import { GreatCircle } from 'arc';
const gc = new GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
const line = gc.Arc(100);
console.log(line.json()); // GeoJSON output
```

### TypeScript
```typescript
import { GreatCircle, CoordinatePoint } from 'arc';

const start: CoordinatePoint = { x: -122, y: 48 };
const end: CoordinatePoint = { x: -77, y: 39 };
const gc = new GreatCircle(start, end);
const line = gc.Arc(100);
```

### Browser (Global)
```html
<script src="./arc.js"></script>
<script>
  const gc = new arc.GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
  const line = gc.Arc(100);
</script>
```

## API Reference

### Basic Usage

#### 1. Define coordinates
Coordinates use `x` for longitude and `y` for latitude (both in degrees):

```js
const start = { x: -122, y: 48 };  // Seattle
const end = { x: -77, y: 39 };     // Washington DC
```

#### 2. Create a GreatCircle
```js
const gc = new GreatCircle(start, end, { name: 'Seattle to DC' });
```

#### 3. Generate the arc
```js
const line = gc.Arc(100, { offset: 10 });
```

**Parameters:**
- `npoints` (number): Number of intermediate points (higher = more accurate)
- `options.offset` (number): Dateline crossing threshold in degrees (default: 10)

### TypeScript Support

```typescript
import { GreatCircle, CoordinatePoint, ArcOptions } from 'arc';

// Define custom properties interface
interface RouteProperties {
  name: string;
  color?: string;
}

const start: CoordinatePoint = { x: -122, y: 48 };
const end: CoordinatePoint = { x: -77, y: 39 };
const properties: RouteProperties = { name: 'Seattle to DC', color: 'blue' };

const gc = new GreatCircle(start, end, properties);
const options: ArcOptions = { offset: 10 };
const line = gc.Arc(100, options);

// Fully typed return values
const geojson = line.json(); // GeoJSONFeature
const wkt = line.wkt();      // string
```

**Available Types:** `CoordinatePoint`, `ArcOptions`, `Coord`, `GreatCircle`, `Arc`, `GeoJSONFeature`

### Output Formats

#### Raw Arc Object
The generated arc contains intermediate coordinate pairs:

```js
{
  properties: { name: 'Seattle to DC' },
  geometries: [
    {
      coords: [
        [-122, 48],
        [-112.06162, 47.724167],
        [-102.384043, 46.608132],
        [-93.227189, 44.716217],
        [-84.74824, 42.144155],
        [-77, 39]
      ],
      length: 6
    }
  ]
}
```

#### GeoJSON Format
```js
const geojson = line.json();
// Returns:
{
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [[-122, 48], [-112.06162, 47.724167], ...]
  },
  properties: { name: 'Seattle to DC' }
}
```

#### WKT Format
```js
const wkt = line.wkt();
// Returns:
'LINESTRING(-122 48,-112.061619 47.724167,-102.384043 46.608131,...)'
```

### Dateline Crossing

The library automatically handles routes that cross the international dateline. The `offset` option (default: 10) controls how close to the dateline a route must be before it gets split into multiple segments. For routes near the poles, you may need a higher offset value.

## Examples

See the [interactive demo](https://danespringmeyer.com/arc.js/) for sample code showing how to create GeoJSON feature collections from multiple routes.

## License

This project is licensed under the BSD license. See [LICENSE.md](LICENSE.md) for details.

### Third-Party Licenses

This project includes code ported from GDAL (Geospatial Data Abstraction Library), which is licensed under the MIT/X11 license. See [GDAL-LICENSE.md](GDAL-LICENSE.md) for the full GDAL license text and attribution details.
