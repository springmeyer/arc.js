# arc.js

Calculate great circles routes.

Algorithms from http://williams.best.vwh.net/avform.htm#Intermediate

# Usage

    var seattle = new arc.Coord(-122, 48);
    var dc = new arc.Coord(-77, 39);
    var gc = new arc.GreatCircle(seattle, dc);
    var options = {endpoints:false, mercator:true};
    console.log(JSON.stringify(gc.geoJSON(50,options)));
