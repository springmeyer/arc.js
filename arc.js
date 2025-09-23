"use strict";
var arc = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    Arc: () => Arc,
    Coord: () => Coord,
    D2R: () => D2R,
    GreatCircle: () => GreatCircle,
    R2D: () => R2D,
    _LineString: () => _LineString,
    roundCoords: () => roundCoords
  });

  // src/utils.ts
  function roundCoords(coords) {
    const PRECISION = 6;
    const MULTIPLIER = Math.pow(10, PRECISION);
    const rounded = [];
    for (let i = 0; i < coords.length; i++) {
      const coord = coords[i];
      if (coord !== void 0) {
        rounded[i] = Math.round(
          (coord + Number.EPSILON) * MULTIPLIER
        ) / MULTIPLIER;
      }
    }
    return rounded;
  }
  var D2R = Math.PI / 180;
  var R2D = 180 / Math.PI;

  // src/coord.ts
  var Coord = class _Coord {
    lon;
    lat;
    x;
    y;
    constructor(lon, lat) {
      this.lon = lon;
      this.lat = lat;
      this.x = D2R * lon;
      this.y = D2R * lat;
    }
    /**
     * Get a string representation of the coordinate
     * 
     * @returns String representation of the coordinate
     * 
     * @example
     * ```typescript
     * const coord = new Coord(45.123456789, 50.987654321);
     * console.log(coord.view()); // "45.123457,50.987654"
     * ```
     */
    view() {
      return String(this.lon).slice(0, 4) + "," + String(this.lat).slice(0, 4);
    }
    /**
     * Get the antipodal point (diametrically opposite point on the sphere)
     * 
     * @returns Antipodal point
     * 
     * @example
     * ```typescript
     * const coord = new Coord(45.123456789, 50.987654321);
     * console.log(coord.antipode()); // Coord { lon: -45.123457, lat: -50.987654 }
     * ```
     */
    antipode() {
      const anti_lat = -1 * this.lat;
      const anti_lon = this.lon < 0 ? 180 + this.lon : (180 - this.lon) * -1;
      return new _Coord(anti_lon, anti_lat);
    }
  };

  // src/arc.ts
  var Arc = class {
    properties = {};
    geometries = [];
    constructor(properties) {
      if (properties) this.properties = properties;
    }
    /**
     * Convert to GeoJSON Feature
     * 
     * @returns GeoJSON Feature with LineString or MultiLineString geometry
     * 
     * @example
     * ```typescript
     * const gc = new GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
     * const arc = gc.Arc(3);
     * console.log(arc.json()); 
     * // { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-122, 48], [-99.5, 43.5], [-77, 39]] }, properties: {} }
     * ```
     */
    json() {
      if (this.geometries.length === 0) {
        return {
          type: "Feature",
          // NOTE: coordinates: null is non-standard GeoJSON (RFC 7946 specifies empty array [])
          // but maintained for backward compatibility with original arc.js behavior
          geometry: { type: "LineString", coordinates: null },
          properties: this.properties
        };
      }
      if (this.geometries.length === 1) {
        const firstGeometry = this.geometries[0];
        if (!firstGeometry) {
          return {
            type: "Feature",
            geometry: { type: "LineString", coordinates: [] },
            properties: this.properties
          };
        }
        return {
          type: "Feature",
          geometry: { type: "LineString", coordinates: firstGeometry.coords },
          properties: this.properties
        };
      }
      const coordinates = this.geometries.filter((geom) => geom !== void 0).map((geom) => geom.coords);
      return {
        type: "Feature",
        geometry: { type: "MultiLineString", coordinates },
        properties: this.properties
      };
    }
    /**
     * Convert to WKT (Well Known Text) format
     * 
     * @returns WKT string representation
     * 
     * @example
     * ```typescript
     * const arc = new Arc({ name: 'test-arc' });
     * console.log(arc.wkt()); // "LINESTRING EMPTY" or "LINESTRING(lon lat,lon lat,...)"
     * ```
     */
    wkt() {
      if (this.geometries.length === 0) {
        return "";
      }
      let wktParts = [];
      for (const geometry of this.geometries) {
        if (!geometry || geometry.coords.length === 0) {
          wktParts.push("LINESTRING EMPTY");
          continue;
        }
        const coordStrings = geometry.coords.filter((coord) => coord !== void 0).map((coord) => {
          const lon = coord[0] ?? 0;
          const lat = coord[1] ?? 0;
          return `${lon} ${lat}`;
        });
        if (coordStrings.length === 0) {
          wktParts.push("LINESTRING EMPTY");
        } else {
          wktParts.push(`LINESTRING(${coordStrings.join(",")})`);
        }
      }
      return wktParts.join("; ");
    }
  };

  // src/line-string.ts
  var _LineString = class {
    coords = [];
    length = 0;
    /**
     * Add a coordinate to the line string
     * 
     * @param coord - Coordinate position to add
     */
    move_to(coord) {
      this.length++;
      this.coords.push(coord);
    }
  };

  // src/great-circle.ts
  var GreatCircle = class {
    start;
    end;
    properties;
    g;
    constructor(start, end, properties) {
      if (!start || start.x === void 0 || start.y === void 0) {
        throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
      }
      if (!end || end.x === void 0 || end.y === void 0) {
        throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
      }
      this.start = new Coord(start.x, start.y);
      this.end = new Coord(end.x, end.y);
      this.properties = properties || {};
      const w = this.start.x - this.end.x;
      const h = this.start.y - this.end.y;
      const z = Math.pow(Math.sin(h / 2), 2) + Math.cos(this.start.y) * Math.cos(this.end.y) * Math.pow(Math.sin(w / 2), 2);
      this.g = 2 * Math.asin(Math.sqrt(z));
      if (this.g === Math.PI) {
        throw new Error("it appears " + this.start.view() + " and " + this.end.view() + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");
      } else if (isNaN(this.g)) {
        throw new Error("could not calculate great circle between " + start + " and " + end);
      }
    }
    /**
     * Interpolate along the great circle
     * http://williams.best.vwh.net/avform.htm#Intermediate
     * 
     * @param f - Interpolation factor
     * @returns Interpolated point
     * 
     * @example
     * ```typescript
     * const greatCircle = new GreatCircle({ x: 45.123456789, y: 50.987654321 }, { x: 46.123456789, y: 51.987654321 });
     * console.log(greatCircle.interpolate(0.5)); // [45.623457, 51.487654]
     * ```
     */
    interpolate(f) {
      const A = Math.sin((1 - f) * this.g) / Math.sin(this.g);
      const B = Math.sin(f * this.g) / Math.sin(this.g);
      const x = A * Math.cos(this.start.y) * Math.cos(this.start.x) + B * Math.cos(this.end.y) * Math.cos(this.end.x);
      const y = A * Math.cos(this.start.y) * Math.sin(this.start.x) + B * Math.cos(this.end.y) * Math.sin(this.end.x);
      const z = A * Math.sin(this.start.y) + B * Math.sin(this.end.y);
      const lat = R2D * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      const lon = R2D * Math.atan2(y, x);
      return [lon, lat];
    }
    /**
     * Generate points along the great circle
     * 
     * @param npoints - Number of points to generate
     * @param options - Optional options object
     * @returns Arc object
     * 
     * @example
     * ```typescript
     * const greatCircle = new GreatCircle({ x: 45.123456789, y: 50.987654321 }, { x: 46.123456789, y: 51.987654321 });
     * console.log(greatCircle.Arc(10)); // Arc { geometries: [ [Array] ] }
     * ```
     */
    Arc(npoints, options) {
      let first_pass = [];
      if (!npoints || npoints <= 2) {
        first_pass.push([this.start.lon, this.start.lat]);
        first_pass.push([this.end.lon, this.end.lat]);
      } else {
        const delta = 1 / (npoints - 1);
        for (let i = 0; i < npoints; ++i) {
          const step = delta * i;
          const pair = this.interpolate(step);
          first_pass.push(pair);
        }
      }
      let bHasBigDiff = false;
      let dfMaxSmallDiffLong = 0;
      const dfDateLineOffset = options?.offset ?? 10;
      const dfLeftBorderX = 180 - dfDateLineOffset;
      const dfRightBorderX = -180 + dfDateLineOffset;
      const dfDiffSpace = 360 - dfDateLineOffset;
      for (let j = 1; j < first_pass.length; ++j) {
        const dfPrevX = first_pass[j - 1]?.[0] ?? 0;
        const dfX = first_pass[j]?.[0] ?? 0;
        const dfDiffLong = Math.abs(dfX - dfPrevX);
        if (dfDiffLong > dfDiffSpace && (dfX > dfLeftBorderX && dfPrevX < dfRightBorderX || dfPrevX > dfLeftBorderX && dfX < dfRightBorderX)) {
          bHasBigDiff = true;
        } else if (dfDiffLong > dfMaxSmallDiffLong) {
          dfMaxSmallDiffLong = dfDiffLong;
        }
      }
      const poMulti = [];
      if (bHasBigDiff && dfMaxSmallDiffLong < dfDateLineOffset) {
        let poNewLS = [];
        poMulti.push(poNewLS);
        for (let k = 0; k < first_pass.length; ++k) {
          const dfX0 = parseFloat((first_pass[k]?.[0] ?? 0).toString());
          if (k > 0 && Math.abs(dfX0 - (first_pass[k - 1]?.[0] ?? 0)) > dfDiffSpace) {
            const dfX1 = parseFloat((first_pass[k - 1]?.[0] ?? 0).toString());
            const dfY1 = parseFloat((first_pass[k - 1]?.[1] ?? 0).toString());
            const dfX2 = parseFloat((first_pass[k]?.[0] ?? 0).toString());
            const dfY2 = parseFloat((first_pass[k]?.[1] ?? 0).toString());
            if (dfX1 > -180 && dfX1 < dfRightBorderX && dfX2 === 180 && k + 1 < first_pass.length && (first_pass[k - 1]?.[0] ?? 0) > -180 && (first_pass[k - 1]?.[0] ?? 0) < dfRightBorderX) {
              poNewLS.push([-180, first_pass[k]?.[1] ?? 0]);
              k++;
              poNewLS.push([first_pass[k]?.[0] ?? 0, first_pass[k]?.[1] ?? 0]);
              continue;
            } else if (dfX1 > dfLeftBorderX && dfX1 < 180 && dfX2 === -180 && k + 1 < first_pass.length && (first_pass[k - 1]?.[0] ?? 0) > dfLeftBorderX && (first_pass[k - 1]?.[0] ?? 0) < 180) {
              poNewLS.push([180, first_pass[k]?.[1] ?? 0]);
              k++;
              poNewLS.push([first_pass[k]?.[0] ?? 0, first_pass[k]?.[1] ?? 0]);
              continue;
            }
            if (dfX1 < dfRightBorderX && dfX2 > dfLeftBorderX) {
              const tmpX = dfX1;
              const dfX1_new = dfX2;
              const dfX2_new = tmpX;
              const tmpY = dfY1;
              const dfY1_new = dfY2;
              const dfY2_new = tmpY;
            }
            if (dfX1 > dfLeftBorderX && dfX2 < dfRightBorderX) {
              const dfX2_adjusted = dfX2 + 360;
            }
            if (dfX1 <= 180 && dfX2 >= 180 && dfX1 < dfX2) {
              const dfRatio = (180 - dfX1) / (dfX2 - dfX1);
              const dfY = dfRatio * dfY2 + (1 - dfRatio) * dfY1;
              poNewLS.push([(first_pass[k - 1]?.[0] ?? 0) > dfLeftBorderX ? 180 : -180, dfY]);
              poNewLS = [];
              poNewLS.push([(first_pass[k - 1]?.[0] ?? 0) > dfLeftBorderX ? -180 : 180, dfY]);
              poMulti.push(poNewLS);
            } else {
              poNewLS = [];
              poMulti.push(poNewLS);
            }
            poNewLS.push([dfX0, first_pass[k]?.[1] ?? 0]);
          } else {
            poNewLS.push([first_pass[k]?.[0] ?? 0, first_pass[k]?.[1] ?? 0]);
          }
        }
      } else {
        const poNewLS0 = [];
        poMulti.push(poNewLS0);
        for (let l = 0; l < first_pass.length; ++l) {
          poNewLS0.push([first_pass[l]?.[0] ?? 0, first_pass[l]?.[1] ?? 0]);
        }
      }
      const arc = new Arc(this.properties);
      for (let m = 0; m < poMulti.length; ++m) {
        const line = new _LineString();
        arc.geometries.push(line);
        const points = poMulti[m];
        if (points) {
          for (let j0 = 0; j0 < points.length; ++j0) {
            const point = points[j0];
            if (point) {
              line.move_to(roundCoords([point[0], point[1]]));
            }
          }
        }
      }
      return arc;
    }
  };
  return __toCommonJS(index_exports);
})();
