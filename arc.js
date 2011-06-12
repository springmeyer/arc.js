var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

var Coord = function(lon,lat) {
    this.lon = lon;
    this.lat = lat;
    this.x = D2R * lon;
    this.y = D2R * lat;
};

Coord.prototype.view = function() {
    return String(this.lon).slice(0,4) + "," + String(this.lat).slice(0,4);
}

/*
 * http://en.wikipedia.org/wiki/Great-circle_distance
 *
 */
var GreatCircle = function(start,end) {

    this.start = start;
    this.end = end;

    var w = this.start.x - this.end.x;
    var h = this.start.y - this.end.y;
    var z = Math.pow(Math.sin(h / 2.0), 2) +
                Math.cos(this.start.y) *
                   Math.cos(this.end.y) *
                     Math.pow(Math.sin(w / 2.0), 2);
    this.g = 2.0 * Math.asin(Math.sqrt(z));

    if (this.g == Math.PI)
        throw new Error('cannot compute intermediate points on a great circle whose endpoints are antipodal');
};

/*
 * http://williams.best.vwh.net/avform.htm#Intermediate
 */
GreatCircle.prototype.project = function(f,options) {
    var A = Math.sin((1 - f) * this.g) / Math.sin(this.g);
    var B = Math.sin(f * this.g) / Math.sin(this.g);
    var x = A * Math.cos(this.start.y) * Math.cos(this.start.x) + B * Math.cos(this.end.y) * Math.cos(this.end.x);
    var y = A * Math.cos(this.start.y) * Math.sin(this.start.x) + B * Math.cos(this.end.y) * Math.sin(this.end.x);
    var z = A * Math.sin(this.start.y) + B * Math.sin(this.end.y);
    var lat = R2D * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    var lon = R2D * Math.atan2(y, x);
    if (options && options.mercator) {
        x = lon * 20037508.34 / 180;
        y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return [x, y];
    } else {
        return [lon, lat];
    }
};


/*
 * Generate points along the great circle
 */
GreatCircle.prototype.points = function(npoints,options) {
    if (npoints <= 1)
        throw new Error('npoints must be greater than 1');
    else if (npoints == 2)
        return [this.start.lon, this.end.lat], [this.start.lon, this.end.lat];
    var delta = 1.0 / (npoints - 1);
    var f = [];
    for (i = 0; i < npoints; i++) {
        f.push(delta * i);
    }
    var coords = [];
    for (i = 0; i < f.length; i++) {
        coords.push(this.project(f[i], options));
    }
    return coords;
};

/*
 * Dump out as GeoJSON linestring, optionally with endpoints
 */
GreatCircle.prototype.geoJSON = function(npoints,options) {
    var coords = this.points(npoints, options);
    var fc = { 'type': 'FeatureCollection',
               'features': [
                  {'geometry': { 'type': 'LineString', 'coordinates': coords },
                                 'type': 'Feature', 'properties': {'name': 'route'}}
               ]
             };
    if (options && options.mercator) {
        fc.crs = { 'type': 'name',
                   'properties': {
                   'href': 'http://spatialreference.org/ref/sr-org/6/proj4/',
                   'type': 'proj4'
                    }
                 };
    } else {
        fc.crs = { 'type': 'name',
                   'properties': {
                   'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
                    }
                 };
    }
    if (options && options.endpoints) {
        var start = {'geometry': { 'type': 'Point', 'coordinates': coords[0]},
                       'type': 'Feature', 'properties': {'name': 'start'}};
        var end = {'geometry': { 'type': 'Point', 'coordinates': coords[coords.length - 1]},
                       'type': 'Feature', 'properties': {'name': 'end'}};
        fc.features.push(start);
        fc.features.push(end);
    }

    return fc;

};

if (typeof window === 'undefined') {
  // nodejs
  module.exports.GreatCircle = GreatCircle;
  module.exports.Coord = Coord;
} else {
  // browser
  var arc = {};
  arc.Coord = Coord;
  arc.GreatCircle = GreatCircle;
}
