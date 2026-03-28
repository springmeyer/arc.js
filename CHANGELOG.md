# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]

## [1.0.0] - 2026-03-29

### Breaking change

- arc.js is now a [pure](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) ESM package. 

If you need to `require()` arc.js as CJS (CommonJS), or have a runtime older than Node.js 18, please use `0.1.4`.

0.x syntax:
```js
const arc = require('arc');
const gc = new arc.GreatCircle(/* */);
```

1.x syntax:
```js
import { GreatCircle } from 'arc';
const gc = new GreatCircle(/* */);
```

### Fixed

- antimeridian splitting in GreatCircle.Arc (From @copilot)

## [0.2.0] - 2025-09-22
### Breaking
- Node.js 16 is now the minimum supported runtime

### Changed
- TypeScript support with backwards compatibility (From @thomas-hervey)

## [0.1.4] - 2022-11-16
### Changed
- Limit output precision to six decimal places

## [0.1.3] - 2022-05-09

### Fixed
- Fix bug when generating string for Antipodal error

## [0.1.2] - 2021-10-13

### Fixed
- Fix link to algorithm used in documentation (https://github.com/springmeyer/arc.js/pull/40)

## [0.1.1] - 2018-06-20

### Added
- Support browserify (https://github.com/springmeyer/arc.js/pull/26)

## 0.1.0 - 2014-02-11

### Changed
- Changed GreatCircle constructor to expect objects like `{x:-122,y:48}` for start/end rather than arc.Coord objects

### Added
- Added mocha tests

### Fixed
- Fixed jshint strict errors

[unreleased]: https://github.com/springmeyer/arc.js/compare/v1.0.0..HEAD
[1.0.0]: https://github.com/springmeyer/arc.js/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/springmeyer/arc.js/compare/v0.1.4...v0.2.0
[0.1.4]: https://github.com/springmeyer/arc.js/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/springmeyer/arc.js/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/springmeyer/arc.js/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/springmeyer/arc.js/compare/v0.1.0...v0.1.1
