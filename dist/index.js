"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._LineString = exports.R2D = exports.D2R = exports.roundCoords = exports.GreatCircle = exports.Arc = exports.Coord = void 0;
// Dual module exports (works for both CommonJS and ESM)
var coord_js_1 = require("./coord.js");
Object.defineProperty(exports, "Coord", { enumerable: true, get: function () { return coord_js_1.Coord; } });
var arc_js_1 = require("./arc.js");
Object.defineProperty(exports, "Arc", { enumerable: true, get: function () { return arc_js_1.Arc; } });
var great_circle_js_1 = require("./great-circle.js");
Object.defineProperty(exports, "GreatCircle", { enumerable: true, get: function () { return great_circle_js_1.GreatCircle; } });
var utils_js_1 = require("./utils.js");
Object.defineProperty(exports, "roundCoords", { enumerable: true, get: function () { return utils_js_1.roundCoords; } });
Object.defineProperty(exports, "D2R", { enumerable: true, get: function () { return utils_js_1.D2R; } });
Object.defineProperty(exports, "R2D", { enumerable: true, get: function () { return utils_js_1.R2D; } });
var line_string_js_1 = require("./line-string.js");
Object.defineProperty(exports, "_LineString", { enumerable: true, get: function () { return line_string_js_1._LineString; } });
//# sourceMappingURL=index.js.map