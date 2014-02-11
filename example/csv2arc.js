#!/usr/bin/env node

/*

Sample code to parse a pre-formatted csv file into
a GeoJSON feature collection.

This script is intended as a starting point only.

You will need to modify depending on your csv format.

*/

var arc = require('arc');
var fs = require('fs');
var path = require('path');

var features = [];
var geojson = { 'type': 'FeatureCollection',
                'features': features
              };

// helper to check if a string value
// likely should be converted to a number
// http://stackoverflow.com/questions/1303646/check-variable-whether-is-number-or-string-in-javascript
function isNumber(o) {
  return ! isNaN (o-0);
}

// path to csv file
var csv_file = 'example/routes.csv';

// csv delimiter used between values
var dl = ',';

// line break character - unix
var lb = '\n';

// open file as buffer
var csv_data = fs.readFileSync(csv_file);

// read as string
var csv_string = csv_data.toString();

// break string at each line
var csv_rows = csv_string.split(lb);

// extract and split headers
var csv_headers = csv_rows[0].split(dl);

// assume properties names are header 5 and above
var csv_properties_names = csv_headers.slice(4);

// all lines of data, excluding header row
var csv_lines = csv_rows.slice(-3);

// loop over every row
csv_lines.forEach(function(row,idx) {
    // split all values in the row into an array
    var values = row.split(dl);
    
    /* handle geometry data first */
    
    // assume first 4 values are coordinate pairs
    var coords = values.slice(0,4);
    
    // convert each by trimming string and converting to a number
    var start_x = parseFloat(coords[0].trim());  // first longitude
    var start_y = parseFloat(coords[1].trim());  // first latitude
    var end_x = parseFloat(coords[2].trim());    // second longitude
    var end_y = parseFloat(coords[3].trim());    // second latitude
    
    // now create special arc Coordinate objects from the start and end pairs
    var start = {x: start_x, y: start_y};
    var end = {x: end_x, y: end_y};


    /* handle properties (csv attributes) second */

    // assume all values from 5 on are attributes
    var attributes = values.slice(4);

    // create a json object to push the attributes into
    var properties = {}
    
    // loop over column header names for the attributes
    // adding them to the properties object
    csv_properties_names.forEach(function(name,idx) {
        var att_value = attributes[idx].trim();

        if (isNumber(att_value)) {
            // if int
            if (parseInt(att_value) == parseFloat(att_value)) {
               att_value = parseInt(att_value);
            } else {
            // likely a float
               att_value = parseFloat(att_value);
            }
        } else {
            // if it is a quoted string, strip quotes
            var f = att_value.charAt(0);
            var l = att_value.charAt(-0);
            if ((f == "\"" && l == "\"") || (f == "\'" && l == "\'")) {
               att_value = att_value.slice(1,-1).trim();
            }        
        }
        properties[name.trim()] = att_value;
    });
    
    // now actually form up the GreatCircle object
    var gc = new arc.GreatCircle(start, end, properties);

    // build out a linestring with 10 intermediate points
    var line = gc.Arc(10);
    
    // add this line to the json features
    features.push(line.json());
});

// print out the full geojson before leaving script
console.log(JSON.stringify(geojson));
