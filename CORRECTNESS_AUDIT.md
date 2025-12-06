# ESLint Boundary Rule - Correctness Audit

## Requirements Summary

1. **Alias imports (outside boundaries)**: Use barrel file only (no subpaths like `@validation/isLegalCardChoice`)
2. **Relative imports (within boundary)**: Use nearest non-circular reference
   - Strategy: Check current barrel, then parent, then grandparent, etc.
   - If found in barrel, determine if it's from a file or directory
   - Never suggest `'./'` or `'../'` (barrel without file/directory name)
3. **Import splitting**: When exports come from different locations, split imports
4. **Auto-fixing**: Fix when possible, but mark mistakes and move on if can't fix

## Critical Issues Found

### Issue 1: `normalizeBarrelPath` returns `'./'` or `'../'`

**Location**: Line 230-241
**Problem**: Returns `'./'` when path is empty, violating "never suggest trailing slash or import without a word"
**Impact**: Rule suggests invalid imports like `'./'` instead of specific files

### Issue 2: `findNearestExportPath` can return `'./'`

**Location**: Line 350
**Problem**: Returns `relativePath || './'` which can be `'./'` if `normalizeBarrelPath` returns it
**Impact**: Same as Issue 1

### Issue 3: `findNearestExportPath` not finding sibling directories correctly

**Location**: Lines 305-332
**Problem**: When parent barrel is circular, it checks subdirectories but `parseBarrelExports` may not be finding exports correctly, or the logic flow is wrong
**Impact**: Returns `null` when it should find `./gameEffects` or `./playerChoices`

### Issue 4: Same directory barrel import logic

**Location**: Lines 684-718
**Problem**: When importing from `'./'`, it uses `findNearestExportPath` but that function may return `'./'` or `null`, not the actual file path
**Impact**: Rule suggests `'./'` instead of `'./getLine'`

### Issue 5: Path existence checks not working

**Location**: Lines 551-557, 563-576
**Problem**: Path existence checks aren't correctly detecting directories with `index.ts` files
**Impact**: Rule doesn't auto-fix when it should

## Logic Flow Issues

### Flow 1: Same Directory Barrel Import (`'./'`)

1. User imports from `'./'` (same directory barrel)
2. Rule should find which file contains the export
3. **BUG**: `findNearestExportPath` may return `'./'` or `null` instead of `'./getLine'`

### Flow 2: Sibling Directory Import (`'../gameEffects'` should be `'./gameEffects'`)

1. User imports from `'../gameEffects'` (wrong path)
2. Rule detects path doesn't exist
3. Rule tries to find correct path using `findNearestExportPath`
4. **BUG**: `findNearestExportPath` returns `null` instead of `'./gameEffects'`

### Flow 3: Parent Barrel with Circular Dependency

1. File is in `events/eventType.ts`
2. Parent barrel `events/index.ts` exports `eventType` (circular)
3. Rule should check subdirectories (`gameEffects`, `playerChoices`)
4. **BUG**: Logic may not be correctly finding exports in subdirectories

## Test Cases

### Test 1: `getLine.test.ts` importing from `'./'`

- **Current**: `import { getLinesFromUnit } from './';`
- **Expected**: Should suggest `'./getLine'`
- **Actual**: Rule suggests `'./'` (WRONG)

### Test 2: `eventType.ts` importing from `'../gameEffects'`

- **Current**: `import { gameEffectEventSchema } from '../gameEffects';`
- **Expected**: Should suggest `'./gameEffects'`
- **Actual**: Rule reports "path not found" (WRONG - should find it)

### Test 3: `getSpacesBehind.ts`

- **Current**: Working correctly
- **Status**: ✅ PASS

## Recommendations

1. **Fix `normalizeBarrelPath`**: Never return `'./'` or `'../'` - always return a specific path
2. **Fix `findNearestExportPath`**:
   - Never return `'./'` or `'../'`
   - When parent barrel is circular, correctly find subdirectories
   - When export is in same directory, return `'./filename'` not `'./'`
3. **Fix path existence checks**: Correctly detect directories with `index.ts`
4. **Add validation**: Before suggesting any path, verify it's not `'./'` or `'../'`
