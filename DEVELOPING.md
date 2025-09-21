# Developing arc.js

This guide covers working with the TypeScript codebase for arc.js.

## Quick Start

```bash
npm install          # Install dependencies
npm run build        # Build all outputs
npm test             # Run TypeScript tests
npm run test:all     # Run all tests (TypeScript + build validation)
```

## Project Structure

```
src/
├── index.ts         # Main entry point
├── coord.ts         # Coordinate class
├── arc.ts           # Arc class  
├── great-circle.ts  # Great circle calculations
├── line-string.ts   # Internal geometry helper
├── utils.ts         # Utility functions
└── types.ts         # TypeScript type definitions

test/
├── *.test.ts        # Jest TypeScript tests (source code)
└── build-output.test.js  # Build validation (compiled output)
```

## Development Workflow

### Testing Locally

```bash
# Run TypeScript tests (fast, for development)
npm test

# Run build validation (slower, tests compiled output)
npm run test:build

# Run everything (recommended before committing)
npm run test:all

# Watch mode for development
npm run test:watch
```

### Building

```bash
npm run build
```

This generates:
- `dist/` - CommonJS output with `.d.ts` files
- `dist/esm/` - ES modules output  
- `arc.js` - Browser bundle (UMD format)

## Publishing

### Development Process

1. **Create PR**: Submit changes via pull request
2. **Code review**: Wait for maintainer approval
3. **Merge**: Maintainer merges approved changes
4. **Publishing**: Maintainer handles npm publishing

### Pre-publish Checklist (for maintainers)

1. **Tests pass**: `npm run test:all`
2. **Build succeeds**: `npm run build`
3. **Version updated**: Update `package.json` version
4. **Changelog updated**: Document changes
5. **PR approved**: All changes reviewed and merged

### Publishing Process (maintainers only)

```bash
npm run build        # Builds automatically on prepublishOnly
npm publish
```

The `prepublishOnly` script ensures a fresh build before publishing.

### What Gets Published

- `dist/` folder (compiled JS + TypeScript definitions)
- `arc.js` browser bundle
- `README.md`, `LICENSE.md`, `CHANGELOG.md`

## TypeScript Development

### TypeScript Configuration

- **Source**: Modern TypeScript with strict settings
- **Output**: ES2022 for broad compatibility
- **Paths**: `@/` alias maps to `src/` in tests
- **Declarations**: Full `.d.ts` generation for consumers
### Adding New Types

1. Add interfaces/types to `src/types.ts`. You can see that it makes use of some GeoJSON types, but in the future it may want to use more of them.
2. Export public types from `src/index.ts`
3. Import types with `import type { ... }`
4. Add tests in relevant `test/*.test.ts` files including typescript.test.ts

## Usage & Module Formats

The package supports multiple import styles:

```javascript
// CommonJS (Node.js)
const { GreatCircle } = require('arc');

// ES Modules  
import { GreatCircle } from 'arc';

// Browser (UMD bundle)
<script src="arc.js"></script>
```

All formats are tested in `test/build-output.test.js`.

## Common Tasks

```bash
# Clean build artifacts
npm run clean

# Development with auto-rebuild
npm run test:watch

# Coverage report
npm run test:coverage

# Check types only (no tests)
npx tsc --noEmit
```
