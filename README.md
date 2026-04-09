# arc.js

Calculate great circle routes as lines in GeoJSON or WKT format.

[**🌍 Try the interactive demo**](https://danespringmeyer.com/arc.js/) - Click to plot great circle arcs on a map!

**Features:**
- Full TypeScript support with type definitions
- Works in Node.js and browsers
- Generates GeoJSON and WKT output formats
- Handles dateline crossing automatically
- Based on [Ed Williams' Aviation Formulary](https://edwilliams.org/avform.htm#Intermediate) algorithms

## Installation

```bash
npm install arc
```

## Quick Start

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

### Browser (ESM)
```html
<script type="module">
  import { GreatCircle } from 'https://cdn.skypack.dev/arc@1';
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
const line = gc.Arc(100);
```

**Parameters:**
- `npoints` (number): Number of intermediate points (higher = more accurate)

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
const line = gc.Arc(100);

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

Routes that cross the international dateline are automatically detected and split into a `MultiLineString` with exact `±180°` boundary points. No configuration is needed.

## Examples

See the [interactive demo](https://danespringmeyer.com/arc.js/) for sample code showing how to create GeoJSON feature collections from multiple routes.

## Used in Turf.js

arc.js powers the [`greatCircle`](https://turfjs.org/docs/api/greatCircle) function in [Turf.js](https://turfjs.org/), a popular geospatial JavaScript library. You can use great circle calculations directly through Turf:

## License

This project is licensed under the BSD license. See [LICENSE.md](LICENSE) for details.
