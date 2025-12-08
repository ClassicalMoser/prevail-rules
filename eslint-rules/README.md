# boundary-alias-vs-relative ESLint Rule

A custom ESLint rule that enforces architectural boundaries using deterministic import path rules. The rule uses pure path math and AST analysis - **no file I/O**.

**Note**: The rule automatically skips checking for external packages (node_modules, npm packages, etc.). Only internal imports (relative paths, boundary aliases, and absolute paths within `rootDir`) are checked.

## What It Does

Enforces clear module boundaries by requiring:

- **Alias imports** (e.g., `@entities`) when importing from **outside** a boundary
- **Relative imports** (e.g., `./file`, `../cousin`) when importing **within** a boundary

All violations are auto-fixable (except ancestor barrel imports).

## Core Algorithm

**By default, imports use alias. Use relative paths only when the first differing segment is close enough.**

1. **Cross-boundary** → `@boundary` (no subpath)
2. **Same boundary** → Find first differing segment:
   - **Same directory** → `./segment` (sibling file or directory)
   - **Parent's sibling (non-top-level)** → `../segment` (cousin, max one `../`)
   - **Top-level or otherwise** → `@boundary/segment` (first differing segment)

## Rules

### 1. Cross-Boundary Imports

Cross-boundary imports MUST use alias (or absolute path, if configured) without subpath.

**With `crossBoundaryStyle: 'alias'` (default):**

```typescript
@entities ✅
@entities/army ❌
../entities/army ❌
```

**With `crossBoundaryStyle: 'absolute'`:**

```typescript
src/domain/entities ✅
src/domain/entities/army ❌
../entities/army ❌
```

### 2. Deterministic Paths

The rule converges to a single legal expression for any given import. Error messages show the exact expected path: `Expected '{{expectedPath}}' but got '{{actualPath}}'`.

### 3. First Differing Segment Algorithm

For within-boundary imports, the rule finds where the target and importing file paths diverge:

1. Get both **directory** paths relative to the boundary root
2. Find the first segment where the directories differ
3. If directories are the same, the filename itself is the differing segment
4. Apply rules based on where that differing segment is located

**Key Constraint**: Relative paths must have only ONE name (assumes barrel files):

```typescript
./sibling ✅ (one name)
./dir ✅ (one name - directory, relies on barrel)
../cousin ✅ (one name - directory, relies on barrel)
./dir/file ❌ (two names - antipattern)
../parent/file ❌ (two names - antipattern)
```

### 4. Max One `../` Rule

Relative paths can use at most one `../`. If more are needed, use alias instead.

```typescript
../cousin ✅ (one ../)
../../subdir ❌ (two ../) → Use @boundary/subdir instead
```

### 5. Top-Level Preference

Top-level paths (direct children of boundary) prefer alias even if one `../` would work.

```typescript
@queries/subdir ✅ (top-level, prefer alias)
../subdir ❌ (even though it would work, prefer alias for top-level)
```

### 6. Ancestor Barrel Prevention

Cannot import from ancestor barrel (prevents circular dependencies). This is detected but not auto-fixable.

```typescript
@boundary ❌ (ancestor barrel - forbidden, not fixable)
```

### 7. Barrel Files as Module Interface

The rule enforces that barrel files (`index.ts`) are the **module interface** for each directory. By requiring imports like `./dir` instead of `./dir/file`, the rule ensures:

- **Consistent import pattern**: All imports go through the barrel file
- **Deterministic paths**: One correct way to import from any location
- **Module boundary enforcement**: You cannot bypass the barrel to import files directly

**Flexible for different contexts:**

- **Libraries/Packages**: Universal barrel files with universal exports are standard. The rule enforces deterministic paths regardless of what the barrel exports.
- **Applications**: Selective barrel files that export only the public API. The rule enforces the API boundary pattern.

The rule is **barrel-agnostic** - it doesn't care what the barrel exports, only that you go through it. This makes it:

- **Flexible**: Works in both library and application contexts
- **Deterministic**: Always one correct path (pure path math)
- **Correct**: The algorithm is sound regardless of barrel contents

This pattern works whether your barrel files export everything (libraries) or selectively export (applications) - the rule enforces the path pattern, not the export strategy.

## Type-Only Imports

The rule distinguishes between **type-only imports** (`import type`) and **value imports** (`import`). This allows you to have different boundary rules for types vs values:

- **Type imports** don't create runtime dependencies, so you may want to allow them from more boundaries
- **Value imports** create runtime dependencies and should be more strictly controlled

### Configuration Example

```javascript
{
  dir: 'domain/entities',
  alias: '@entities',
  // Only allow value imports from @events
  allowImportsFrom: ['@events'],
  // But allow type imports from more boundaries
  allowTypeImportsFrom: ['@events', '@queries', '@commands'],
}
```

### Usage Example

```typescript
// Type-only import - allowed because @queries is in allowTypeImportsFrom
import type { QueryResult } from '@queries'; ✅

// Value import - not allowed because @queries is not in allowImportsFrom
import { executeQuery } from '@queries'; ❌
```

**Note**: The rule automatically detects type-only imports using the TypeScript ESLint parser's `importKind` property. Dynamic imports (`import()`) and `require()` calls are always treated as value imports.

## Examples

### Same Directory (Sibling)

```typescript
// FROM: src/domain/queries/test-rules/testFile.ts
// TO: src/domain/queries/test-rules/sibling.ts
import { something } from './sibling'; ✅
import { something } from '@queries/sibling'; ❌
```

### Parent's Sibling (Cousin, Non-Top-Level)

```typescript
// FROM: src/domain/queries/test-rules/subdir/file.ts
// TO: src/domain/queries/test-rules/otherSubdir/
import { something } from '../otherSubdir'; ✅
import { something } from '@queries/otherSubdir'; ❌
```

### Top-Level Path

```typescript
// FROM: src/domain/queries/test-rules/testFile.ts
// TO: src/domain/queries/otherTopLevel/
import { something } from '@queries/otherTopLevel'; ✅
import { something } from '../otherTopLevel'; ❌
```

### Boundary Root File

```typescript
// FROM: src/domain/queries/test-rules/testFile.ts
// TO: src/domain/queries/getLine.ts
import { getLine } from '@queries/getLine'; ✅
import { getLine } from '../getLine'; ❌
```

## Configuration

```javascript
// eslint.config.js
import boundaryAliasVsRelative from './eslint-rules/boundaryAliasVsRelative.js';

export default {
  plugins: {
    boundary: {
      rules: {
        'boundary-alias-vs-relative': boundaryAliasVsRelative,
      },
    },
  },
  rules: {
    'boundary/boundary-alias-vs-relative': [
      'error',
      {
        rootDir: 'src',
        crossBoundaryStyle: 'alias', // or 'absolute' - default: 'alias'
        boundaries: [
          { dir: 'domain/entities', alias: '@entities' },
          { dir: 'domain/queries', alias: '@queries' },
          // ... more boundaries
        ],
      },
    ],
  },
};
```

### Configuration Options

- **`rootDir`** (string, default: `'src'`): Root directory for resolving boundary paths
- **`crossBoundaryStyle`** (`'alias'` | `'absolute'`, default: `'alias'`): Style for cross-boundary imports
  - `'alias'`: Use alias paths like `@entities` (recommended)
  - `'absolute'`: Use absolute paths relative to `rootDir` like `src/domain/entities`
- **`defaultSeverity`** (`'error'` | `'warn'`, default: `'error'`): Default severity for violations
  - `'error'`: Violations are errors (default)
  - `'warn'`: Violations are warnings (useful during refactoring)
- **`allowUnknownBoundaries`** (boolean, default: `false`): Allow imports from paths outside all configured boundaries
  - `false`: Forbid imports from unknown paths (default, stricter)
  - `true`: Allow imports from unknown paths (more permissive)
  - **Note**: External packages (node_modules, npm packages) are automatically skipped and not checked, regardless of this setting
- **`skipBoundaryRulesForTestFiles`** (boolean, default: `false`): Skip allow/deny boundary rules for test files, but still enforce path format (alias vs relative). Test files can import from any boundary, but must use correct import paths. **Recommended**: Set this to `true` in ESLint config blocks for test files (see example below).
- **`boundaries`** (array, required): Array of boundary definitions with:
  - **`dir`** (string, required): Relative directory path (e.g., `'domain/entities'`)
  - **`alias`** (string, required): Import alias (e.g., `'@entities'`)
  - **`severity`** (`'error'` | `'warn'`, optional): Override default severity for this boundary
  - **`allowImportsFrom`** (string[], optional): Array of boundary aliases that can be imported from (for value imports)
  - **`denyImportsFrom`** (string[], optional): Array of boundary aliases that cannot be imported from
  - **`allowTypeImportsFrom`** (string[], optional): Array of boundary aliases that can be imported as types (overrides `allowImportsFrom` for type-only imports). Useful when you want to allow type imports from more boundaries than value imports.
  - **`nestedPathFormat`** (`'alias'` | `'relative'` | `'inherit'`, optional): Path format for nested boundaries

### Test Files Configuration

The rule uses ESLint's file matching (idiomatic approach) rather than pattern detection. Configure test files using ESLint config blocks:

```javascript
export default [
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    rules: {
      'boundary/boundary-alias-vs-relative': [
        'error',
        {
          rootDir: 'src',
          boundaries: [/* ... */],
        },
      ],
    },
  },
  {
    // Test files: skip boundary rules but keep path format enforcement
    files: [
      '**/*.test.{ts,js}',
      '**/*.spec.{ts,js}',
      '**/*.mock.{ts,js}',  // Custom mock pattern
      '**/__tests__/**',
      '**/__mocks__/**',
    ],
    rules: {
      'boundary/boundary-alias-vs-relative': [
        'error',
        {
          rootDir: 'src',
          skipBoundaryRulesForTestFiles: true, // Test files can import from any boundary
          boundaries: [/* same boundaries */],
        },
      ],
    },
  },
];
```

**Why this approach?**
- Uses ESLint's native file matching (idiomatic)
- More flexible: different configs for different test file types
- No pattern duplication: ESLint handles file matching
- Clear separation: test file config is explicit in your ESLint config

### Recommended Defaults

For projects using **hexagonal architecture** (ports and adapters), you can use the provided defaults:

```javascript
import boundaryAliasVsRelative from './eslint-rules/boundaryAliasVsRelative.js';
import { hexagonalDefaults } from './eslint-rules/boundaryAliasVsRelative/defaults.js';

export default {
  plugins: {
    boundary: {
      rules: {
        'boundary-alias-vs-relative': boundaryAliasVsRelative,
      },
    },
  },
  rules: {
    'boundary/boundary-alias-vs-relative': [
      'error',
      hexagonalDefaults(), // Use hexagonal defaults
    ],
  },
};
```

**Override specific values:**

```javascript
'boundary/boundary-alias-vs-relative': [
  'error',
  hexagonalDefaults({
    rootDir: 'lib', // Override rootDir
    boundaries: [
      ...hexagonalDefaults().boundaries,
      { dir: 'shared', alias: '@shared' }, // Add custom boundary
    ],
  }),
],
```

**Available defaults:**

- `hexagonalDefaults()` - Full hexagonal architecture with allow/deny rules
- `simpleDefaults()` - Simple boundaries with no architectural restrictions (path format only)

See [`HEXAGONAL_DEFAULTS.md`](./HEXAGONAL_DEFAULTS.md) for detailed documentation of the hexagonal architecture patterns.

## Building

```bash
npm run build:eslint-rule
```

This uses `tsdown` to bundle the TypeScript into a single JavaScript file.

## Implementation Details

- **No file I/O**: Pure path math and AST analysis
- **Deterministic**: Always converges to a single correct answer
- **Fast**: No file system operations, suitable for large codebases
- **Auto-fixable**: 95% of violations are auto-fixable (ancestor barrel requires manual fix)
- **Simple**: ~625 lines of code, clean separation of concerns

## Error Messages

Error messages show the exact expected path:

```
Expected '@entities' but got '@entities/army'
Expected './sibling' but got '@queries/sibling'
Expected '../cousin' but got '@queries/cousin'
```

Ancestor barrel imports show:

```
Cannot import from ancestor barrel '@queries'. This would create a circular dependency. Import from the specific file or directory instead.
```

## Key Insights

**We don't need to know what files export.**

We only need to know:

1. Which boundary a path belongs to
2. Where the first differing segment is located
3. What the correct import path should be

All of this can be done with:

- Path manipulation (no file I/O)
- AST analysis (already provided by ESLint)
- Simple rules (deterministic)
