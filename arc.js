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

var Arc = function(name) {
    this.name = name;
    this.coords = [];
    this.length = 0;
};

Arc.prototype.move_to = function(coord) {
    this.length++;
    this.coords.push(coord);
};

Arc.prototype.json = function() {
    return {'geometry': { 'type': 'LineString', 'coordinates': this.coords },
            'type': 'Feature', 'properties': {'name': this.name}
           };
};

Arc.prototype.wkt = function() {
    var wkt = 'LINESTRING(';
    var that = this;
    this.coords.forEach(function(c,idx) {
        wkt += c[0] + ' ' + c[1] + ',';
    });
    return wkt.substring(0, wkt.length - 1) + ')';
};

/*
 * http://en.wikipedia.org/wiki/Great-circle_distance
 *
 */
var GreatCircle = function(start,end,name) {

    this.start = start;
    this.end = end;
    this.name = name || 'great circle arc';

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
GreatCircle.prototype.Arc = function(npoints,options) {
    var arc = new Arc(this.name);
    if (npoints <= 2) {
        arc.move_to([this.start.lon, this.start.lat]);
        arc.move_to([this.end.lon, this.end.lat]);
    } else {
        var delta = 1.0 / (npoints - 1);
        for (i = 0; i < npoints; i++) {
            var step = delta * i;
            arc.move_to(this.project(step, options));
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
