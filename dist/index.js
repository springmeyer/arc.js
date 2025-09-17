"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2D = exports.D2R = exports.roundCoords = exports.GreatCircle = exports.Arc = exports.Coord = void 0;
// Dual module exports (works for both CommonJS and ESM)
var coord_1 = require("./coord");
Object.defineProperty(exports, "Coord", { enumerable: true, get: function () { return coord_1.Coord; } });
var arc_1 = require("./arc");
Object.defineProperty(exports, "Arc", { enumerable: true, get: function () { return arc_1.Arc; } });
var great_circle_1 = require("./great-circle");
Object.defineProperty(exports, "GreatCircle", { enumerable: true, get: function () { return great_circle_1.GreatCircle; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "roundCoords", { enumerable: true, get: function () { return utils_1.roundCoords; } });
Object.defineProperty(exports, "D2R", { enumerable: true, get: function () { return utils_1.D2R; } });
Object.defineProperty(exports, "R2D", { enumerable: true, get: function () { return utils_1.R2D; } });
//# sourceMappingURL=index.js.map