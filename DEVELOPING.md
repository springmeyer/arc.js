# Developing arc.js

This guide covers working with the TypeScript codebase for arc.js.

## Quick Start

```bash
npm install          # Install dependencies
npm run build        # Build ESM output
npm test             # Run TypeScript tests
```

## Project Structure

```text
src/
├── index.ts         # Main entry point
├── coord.ts         # Coordinate class
├── arc.ts           # Arc class
├── great-circle.ts  # Great circle calculations
├── line-string.ts   # Internal geometry helper
├── utils.ts         # Utility functions
└── types.ts         # TypeScript type definitions

test/
└── *.test.ts        # Jest TypeScript tests
```

## Development Workflow

### Testing Locally

```bash
# Run TypeScript tests (fast, for development)
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Building

```bash
npm run build
```

This generates `dist/` — ESM output with `.d.ts` declaration files.

## Publishing

### Development Process

1. **Create PR**: Submit changes via pull request
2. **Code review**: Wait for maintainer approval
3. **Merge**: Maintainer merges approved changes
4. **Publishing**: Maintainer handles npm publishing

### Pre-publish Checklist (for maintainers)

1. **Tests pass**: `npm test`
2. **Build succeeds**: `npm run build`
3. **Version updated**: Update `package.json` version
4. **Changelog updated**: Document changes
5. **PR approved**: All changes reviewed and merged

### Publishing Process (maintainers only)

```bash
npm publish   # prepublishOnly runs npm run build automatically
```

### What Gets Published

- `dist/` folder (compiled ESM JS + TypeScript definitions)
- `README.md`, `LICENSE.md`, `CHANGELOG.md`

## TypeScript Development

### TypeScript Configuration

- **Source**: Modern TypeScript with strict settings
- **Output**: ES2022, ESM only
- **Declarations**: Full `.d.ts` generation for consumers

### Adding New Types

1. Add interfaces/types to `src/types.ts`
2. Export public types from `src/index.ts`
3. Import types with `import type { ... }`
4. Add tests in relevant `test/*.test.ts` files including `typescript.test.ts`

## Usage

```javascript
// ES Modules (Node.js or bundler)
import { GreatCircle } from 'arc';
```

## Visual Fixture Verification

To inspect all test routes as great circle arcs on a map:

```bash
npm run build                            # dist/ must exist
node scripts/dump-fixtures.mjs | pbcopy  # macOS: copy to clipboard
```

Then, paste the geojson output into a visualization tool to visually verify routes, such as [geojson.io](https://geojson.io).
**Note:** route coordinates in the script are manually updated to keep in sync with `test/fixtures/routes.ts`.

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
