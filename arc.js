var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

var Coord = function(lon,lat) {
    this.lon = lon;
    this.lat = lat;
    this.x = D2R * lon;
    this.y = D2R * lat;
};

Coord.prototype.view = function() {
    return String(this.lon).slice(0, 4) + ',' + String(this.lat).slice(0, 4);
};

Coord.prototype.antipode = function() {

    var anti_lat = -1 * this.lat;
    if (this.lon < 0) {
        var anti_lon = 180 + this.lon;
    } else {
        var anti_lon = (180 - this.lon) * -1;
    }
    return new Coord(anti_lon, anti_lat);
};

var LineString = function() {
    this.coords = [];
    this.length = 0;
};

LineString.prototype.move_to = function(coord) {
    this.length++;
    this.coords.push(coord);
};

var Arc = function(properties) {
    this.properties = properties || {};
    this.geometries = []
};

Arc.prototype.json = function() {
    if (this.geometries.length <= 0) {
        return {'geometry': { 'type': 'LineString', 'coordinates': null },
                'type': 'Feature', 'properties': this.properties
               };
    } else if (this.geometries.length == 1) {
        return {'geometry': { 'type': 'LineString', 'coordinates': this.geometries[0].coords },
                'type': 'Feature', 'properties': this.properties
               };
    } else {
        var multiline = []
        for (i = 0; i < this.geometries.length; i++) {
            multiline.push(this.geometries[i].coords);
        }
        return {'geometry': { 'type': 'MultiLineString', 'coordinates': multiline },
                'type': 'Feature', 'properties': this.properties
               };
    }
};

// TODO - output proper multilinestring
Arc.prototype.wkt = function() {
    var wkt_string = '';
    for (i = 0; i < this.geometries.length; i++) {
        if (this.geometries[i].coords.length === 0) {
            return 'LINESTRING(empty)';
        } else {
            var wkt = 'LINESTRING(';
            this.geometries[i].coords.forEach(function(c,idx) {
                wkt += c[0] + ' ' + c[1] + ',';
            });
            wkt_string += wkt.substring(0, wkt.length - 1) + ')';
        }
    }
    return wkt_string;
};

/*
 * http://en.wikipedia.org/wiki/Great-circle_distance
 *
 */
var GreatCircle = function(start,end,properties) {

    this.start = start;
    this.end = end;
    this.properties = properties || {};

    var w = this.start.x - this.end.x;
    var h = this.start.y - this.end.y;
    var z = Math.pow(Math.sin(h / 2.0), 2) +
                Math.cos(this.start.y) *
                   Math.cos(this.end.y) *
                     Math.pow(Math.sin(w / 2.0), 2);
    this.g = 2.0 * Math.asin(Math.sqrt(z));

    if (this.g == Math.PI) {
        throw new Error('it appears ' + start.view() + ' and ' + end.view() + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");
    } else if (isNaN(this.g)) {
        throw new Error('could not calculate great circle between ' + start + ' and ' + end);
    }
};

/*
 * http://williams.best.vwh.net/avform.htm#Intermediate
 */
GreatCircle.prototype.interpolate = function(f) {
    var A = Math.sin((1 - f) * this.g) / Math.sin(this.g);
    var B = Math.sin(f * this.g) / Math.sin(this.g);
    var x = A * Math.cos(this.start.y) * Math.cos(this.start.x) + B * Math.cos(this.end.y) * Math.cos(this.end.x);
    var y = A * Math.cos(this.start.y) * Math.sin(this.start.x) + B * Math.cos(this.end.y) * Math.sin(this.end.x);
    var z = A * Math.sin(this.start.y) + B * Math.sin(this.end.y);
    var lat = R2D * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    var lon = R2D * Math.atan2(y, x);
    return [lon, lat];
};



/*
 * Generate points along the great circle
 */
GreatCircle.prototype.Arc = function(npoints,options) {
    var first_pass = [];
    //var minx = 0;
    //var maxx = 0;
    if (npoints <= 2) {
        first_pass.push([this.start.lon, this.start.lat]);
        first_pass.push([this.end.lon, this.end.lat]);
    } else {
        var delta = 1.0 / (npoints - 1);
        for (var i = 0; i < npoints; i++) {
            var step = delta * i;
            var pair = this.interpolate(step);
            //minx = Math.min(minx,pair[0]);
            //maxx = Math.max(maxx,pair[0]);
            first_pass.push(pair);
        }
    }
    /* partial port of dateline handling from:
      gdal/ogr/ogrgeometryfactory.cpp

      TODO - does not handle all wrapping scenarios yet
    */
    var bHasBigDiff = false;
    var dfMaxSmallDiffLong = 0;
    for (var i = 1; i < first_pass.length; i++) {
        //if (minx > 170 && maxx > 180) {
        // }
        var dfPrevX = first_pass[i-1][0];
        var dfX = first_pass[i][0];
        var dfDiffLong = Math.abs(dfX - dfPrevX);
        if (dfDiffLong > 350 &&
            ((dfX > 170 && dfPrevX < -170) || (dfPrevX > 170 && dfX < -170))) {
            bHasBigDiff = true;
        } else if (dfDiffLong > dfMaxSmallDiffLong) {
            dfMaxSmallDiffLong = dfDiffLong;
        }
    }

    var poMulti = []

    if (bHasBigDiff && dfMaxSmallDiffLong < 10) {
        var poNewLS = []
        poMulti.push(poNewLS);
        for (var i = 0; i < first_pass.length; i++) {
            var dfX = parseFloat(first_pass[i][0]);
            if (i > 0 &&  Math.abs(dfX - first_pass[i-1][0]) > 350) {
                var dfX1 = parseFloat(first_pass[i-1][0]);
                var dfY1 = parseFloat(first_pass[i-1][1]);
                var dfX2 = parseFloat(first_pass[i][0]);
                var dfY2 = parseFloat(first_pass[i][1]);
                if (dfX1 > -180 && dfX1 < -170 && dfX2 == 180 &&
                    i+1 < first_pass.length &&
                   first_pass[i-1][0] > -180 && first_pass[i-1][0] < -170)
                {
                     poNewLS.push([-180, first_pass[i][1]]);
                     i++;
                     poNewLS.push([first_pass[i][0], first_pass[i][1]]);
                     continue;
                } else if (dfX1 > 170 && dfX1 < 180 && dfX2 == -180 &&
                     i+1 < first_pass.length &&
                     first_pass[i-1][0] > 170 && first_pass[i-1][0] < 180)
                {
                     poNewLS.push([180, first_pass[i][1]]);
                     i++;
                     poNewLS.push([first_pass[i][0], first_pass[i][1]]);
                     continue;
                }

                if (dfX1 < -170 && dfX2 > 170)
                {
                    // swap dfX1, dfX2
                    var tmpX = dfX1;
                    dfX1 = dfX2;
                    dfX2 = tmpX;
                    // swap dfY1, dfY2
                    var tmpY = dfY1;
                    dfY1 = dfY2;
                    dfY2 = tmpY;
                }
                if (dfX1 > 170 && dfX2 < -170) {
                    dfX2 += 360;
                }

                if (dfX1 <= 180 && dfX2 >= 180 && dfX1 < dfX2)
                {
                    var dfRatio = (180 - dfX1) / (dfX2 - dfX1);
                    var dfY = dfRatio * dfY2 + (1 - dfRatio) * dfY1;
                    poNewLS.push([first_pass[i-1][0] > 170 ? 180 : -180, dfY]);
                    poNewLS = [];
                    poNewLS.push([first_pass[i-1][0] > 170 ? -180 : 180, dfY]);
                    poMulti.push(poNewLS);
                }
                else
                {
                    poNewLS = [];
                    poMulti.push(poNewLS);
                }
                poNewLS.push([dfX, first_pass[i][1]]);
            } else {
                poNewLS.push([first_pass[i][0], first_pass[i][1]]);
            }
        }
    } else {
       // add normally
        var poNewLS = []
        poMulti.push(poNewLS);
        for (var i = 0; i < first_pass.length; i++) {
            poNewLS.push([first_pass[i][0],first_pass[i][1]]);
        }
    }

    var arc = new Arc(this.properties);
    for (var i = 0; i < poMulti.length; i++) {
        var line = new LineString();
        arc.geometries.push(line);
        var points = poMulti[i];
        for (var j = 0; j < points.length; j++) {
            line.move_to(points[j]);
        }
    }
    return arc;
};

if (typeof window === 'undefined') {
  // nodejs
  module.exports.Coord = Coord;
  module.exports.Arc = Arc;
  module.exports.GreatCircle = GreatCircle;

} else {
  // browser
  var arc = {};
  arc.Coord = Coord;
  arc.Arc = Arc;
  arc.GreatCircle = GreatCircle;
}
