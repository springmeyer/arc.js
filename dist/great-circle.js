"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreatCircle = void 0;
const coord_js_1 = require("./coord.js");
const arc_js_1 = require("./arc.js");
const line_string_js_1 = require("./line-string.js");
const utils_js_1 = require("./utils.js");
/*
 * Portions of this file contain code ported from GDAL (Geospatial Data Abstraction Library)
 *
 * GDAL is licensed under the MIT/X11 license.
 * See GDAL-LICENSE.md for the full license text.
 *
 * Original source: gdal/ogr/ogrgeometryfactory.cpp
 * Repository: https://github.com/OSGeo/gdal
 */
/**
 * Great Circle calculation class
 * http://en.wikipedia.org/wiki/Great-circle_distance
 *
 * @param start - Start point
 * @param end - End point
 * @param properties - Optional properties object
 *
 * @example
 * ```typescript
 * const greatCircle = new GreatCircle({ x: 45.123456789, y: 50.987654321 }, { x: 46.123456789, y: 51.987654321 });
 * console.log(greatCircle.interpolate(0.5)); // [45.623457, 51.487654]
 * ```
 */
class GreatCircle {
    start;
    end;
    properties;
    g;
    constructor(start, end, properties) {
        if (!start || start.x === undefined || start.y === undefined) {
            throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
        }
        if (!end || end.x === undefined || end.y === undefined) {
            throw new Error("GreatCircle constructor expects two args: start and end objects with x and y properties");
        }
        this.start = new coord_js_1.Coord(start.x, start.y);
        this.end = new coord_js_1.Coord(end.x, end.y);
        this.properties = properties || {};
        const w = this.start.x - this.end.x;
        const h = this.start.y - this.end.y;
        const z = Math.pow(Math.sin(h / 2.0), 2) +
            Math.cos(this.start.y) *
                Math.cos(this.end.y) *
                Math.pow(Math.sin(w / 2.0), 2);
        this.g = 2.0 * Math.asin(Math.sqrt(z));
        if (this.g === Math.PI) {
            throw new Error('it appears ' + this.start.view() + ' and ' + this.end.view() + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");
        }
        else if (isNaN(this.g)) {
            throw new Error('could not calculate great circle between ' + start + ' and ' + end);
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
        const lat = utils_js_1.R2D * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        const lon = utils_js_1.R2D * Math.atan2(y, x);
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
        }
        else {
            const delta = 1.0 / (npoints - 1);
            for (let i = 0; i < npoints; ++i) {
                const step = delta * i;
                const pair = this.interpolate(step);
                first_pass.push(pair);
            }
        }
        /* partial port of dateline handling from:
          gdal/ogr/ogrgeometryfactory.cpp

          TODO - does not handle all wrapping scenarios yet
        */
        let bHasBigDiff = false;
        let dfMaxSmallDiffLong = 0;
        // from http://www.gdal.org/ogr2ogr.html
        // -datelineoffset:
        // (starting with GDAL 1.10) offset from dateline in degrees (default long. = +/- 10deg, geometries within 170deg to -170deg will be splited)
        const dfDateLineOffset = options?.offset ?? 10;
        const dfLeftBorderX = 180 - dfDateLineOffset;
        const dfRightBorderX = -180 + dfDateLineOffset;
        const dfDiffSpace = 360 - dfDateLineOffset;
        // https://github.com/OSGeo/gdal/blob/7bfb9c452a59aac958bff0c8386b891edf8154ca/gdal/ogr/ogrgeometryfactory.cpp#L2342
        for (let j = 1; j < first_pass.length; ++j) {
            const dfPrevX = first_pass[j - 1]?.[0] ?? 0;
            const dfX = first_pass[j]?.[0] ?? 0;
            const dfDiffLong = Math.abs(dfX - dfPrevX);
            if (dfDiffLong > dfDiffSpace &&
                ((dfX > dfLeftBorderX && dfPrevX < dfRightBorderX) || (dfPrevX > dfLeftBorderX && dfX < dfRightBorderX))) {
                bHasBigDiff = true;
            }
            else if (dfDiffLong > dfMaxSmallDiffLong) {
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
                    if (dfX1 > -180 && dfX1 < dfRightBorderX && dfX2 === 180 &&
                        k + 1 < first_pass.length &&
                        (first_pass[k - 1]?.[0] ?? 0) > -180 && (first_pass[k - 1]?.[0] ?? 0) < dfRightBorderX) {
                        poNewLS.push([-180, first_pass[k]?.[1] ?? 0]);
                        k++;
                        poNewLS.push([first_pass[k]?.[0] ?? 0, first_pass[k]?.[1] ?? 0]);
                        continue;
                    }
                    else if (dfX1 > dfLeftBorderX && dfX1 < 180 && dfX2 === -180 &&
                        k + 1 < first_pass.length &&
                        (first_pass[k - 1]?.[0] ?? 0) > dfLeftBorderX && (first_pass[k - 1]?.[0] ?? 0) < 180) {
                        poNewLS.push([180, first_pass[k]?.[1] ?? 0]);
                        k++;
                        poNewLS.push([first_pass[k]?.[0] ?? 0, first_pass[k]?.[1] ?? 0]);
                        continue;
                    }
                    if (dfX1 < dfRightBorderX && dfX2 > dfLeftBorderX) {
                        // swap dfX1, dfX2
                        const tmpX = dfX1;
                        const dfX1_new = dfX2;
                        const dfX2_new = tmpX;
                        // swap dfY1, dfY2
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
                    }
                    else {
                        poNewLS = [];
                        poMulti.push(poNewLS);
                    }
                    poNewLS.push([dfX0, first_pass[k]?.[1] ?? 0]);
                }
                else {
                    poNewLS.push([first_pass[k]?.[0] ?? 0, first_pass[k]?.[1] ?? 0]);
                }
            }
        }
        else {
            // add normally
            const poNewLS0 = [];
            poMulti.push(poNewLS0);
            for (let l = 0; l < first_pass.length; ++l) {
                poNewLS0.push([first_pass[l]?.[0] ?? 0, first_pass[l]?.[1] ?? 0]);
            }
        }
        const arc = new arc_js_1.Arc(this.properties);
        for (let m = 0; m < poMulti.length; ++m) {
            const line = new line_string_js_1._LineString();
            arc.geometries.push(line);
            const points = poMulti[m];
            if (points) {
                for (let j0 = 0; j0 < points.length; ++j0) {
                    const point = points[j0];
                    if (point) {
                        line.move_to((0, utils_js_1.roundCoords)([point[0], point[1]]));
                    }
                }
            }
        }
        return arc;
    }
}
exports.GreatCircle = GreatCircle;
//# sourceMappingURL=great-circle.js.map