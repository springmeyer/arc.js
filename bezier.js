function bezier(pts) {
    function curve(points) {
        var c = [];
        var steps = 40;

        for (var i = 0; i <= steps; i++) {
            var t = i / steps;

            var pt = [
                Math.pow(1 - t, 3) * points[0][0]
                 + 3 * t * Math.pow(1 - t, 2) * points[1][0]
                 + 3 * (1 - t) * Math.pow(t, 2) * points[2][0]
                 + Math.pow(t, 3) * points[3][0],
                Math.pow(1 - t, 3) * points[0][1]
                 + 3 * t * Math.pow(1-t,2) * points[1][1]
                 + 3 * (1-t) * Math.pow(t,2) * points[2][1]
                 + Math.pow(t, 3) * points[3][1]
            ];
            c.push(pt);
        }
        return c;
    }

    var c = [];

    if (pts.length < 4) return pts;

    for (var i = 0; i < pts.length; i += 3) {
        if (i + 4 <= pts.length) {
            c = c.concat(curve(pts.slice(i, i + 4)));
        }
    }

    return c;
}
