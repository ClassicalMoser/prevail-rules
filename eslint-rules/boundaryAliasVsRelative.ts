/**
 * ESLint rule: boundary-alias-vs-relative
 *
 * Enforces architectural boundaries by requiring:
 * - Alias imports (e.g., @entities) when importing from outside a boundary
 * - Relative imports (e.g., ./file) when importing within a boundary
 *
 * This prevents tight coupling between modules and enforces clear module boundaries.
 * The rule also handles case-sensitivity issues on case-insensitive filesystems (macOS)
 * and can auto-fix many import path issues.
 */

import type { Rule } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * Represents a boundary configuration with its directory and alias.
 * absDir is computed at rule initialization for efficient path comparisons.
 */
interface Boundary {
  dir: string; // Relative directory path (e.g., 'domain/entities')
  alias: string; // Import alias (e.g., '@entities')
  absDir: string; // Absolute resolved directory path
}

/**
 * Cached file metadata for the current file being linted.
 * Cached to avoid recomputing on every import statement.
 */
interface FileData {
  isValid: boolean; // False if file path couldn't be resolved
  fileDir?: string; // Directory containing the file
  fileBoundary?: Boundary | null; // Boundary this file belongs to, or null if outside all boundaries
}

/**
 * Rule configuration options from ESLint config.
 */
interface RuleOptions {
  rootDir?: string; // Root directory (defaults to 'src')
  boundaries: Array<{ dir: string; alias: string }>; // Array of boundary definitions
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Enforces alias-only imports from outside boundaries, and relative-only imports inside.',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          rootDir: { type: 'string' },
          boundaries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dir: { type: 'string' },
                alias: { type: 'string' },
              },
              required: ['dir', 'alias'],
            },
            minItems: 1,
          },
        },
        required: ['boundaries'],
      },
    ],
    messages: {
      mustUseAliasFromOutside:
        "Imports into '{{dir}}' must use the alias '{{alias}}' from outside this boundary.",
      mustUseRelativeInside:
        "Imports within '{{dir}}' must be relative; do not use the alias '{{alias}}'.",
      mustUseBarrelFile:
        "Import from the barrel file '{{alias}}' instead of subpath '{{spec}}'.",
      mustUseBarrelFileRelative:
        "Import from '{{barrelPath}}' instead of '{{spec}}'.",
      pathNotFound:
        "Import path '{{spec}}' does not exist or cannot be resolved. Expected path: '{{expectedPath}}'.",
      exportNotFound:
        "Export '{{exportName}}' not found in '{{spec}}'. Check if the export exists or use a different import path.",
    },
  },

  create(context) {
    // Extract and validate rule options
    const [{ rootDir = 'src', boundaries }] = context.options as [RuleOptions];
    const cwd = context.getCwd?.() ?? process.cwd();

    // Pre-resolve all boundary directories to absolute paths for efficient comparison
    // This avoids repeated path resolution during linting
    const resolvedBoundaries: Boundary[] = boundaries.map((b) => ({
      ...b,
      absDir: path.resolve(cwd, rootDir, b.dir),
    }));

    // Cache file metadata per file to avoid recomputation
    // Cleared at the start of each Program node
    let cachedFileData: FileData | null = null;

    // Cache barrel file exports to avoid re-parsing the same files
    // Key: absolute file path, Value: Set of export names or null if file doesn't exist
    const barrelExportsCache = new Map<string, Set<string> | null>();

    /**
     * Track all import declarations in the current file.
     * Used to detect duplicate imports when auto-fixing alias imports to relative.
     * Cleared at the start of each Program node.
     */
    const importDeclarations: Array<{
      node: unknown; // The AST node for the import
      source: string; // The import source path
      importedNames: Set<string>; // Set of imported names from this import
    }> = [];

    /**
     * Get metadata about the current file being linted.
     * Results are cached per file to avoid recomputation.
     *
     * @returns FileData with directory and boundary information, or { isValid: false } if file path is invalid
     */
    function getFileData(): FileData {
      // Return cached data if available
      if (cachedFileData) return cachedFileData;

      // Get filename from context, with fallbacks for different ESLint versions
      const filename =
        context.filename ?? context.getFilename?.() ?? '<unknown>';

      // If filename is not absolute, we can't determine boundaries
      // This can happen with virtual files or in some edge cases
      if (!path.isAbsolute(filename)) {
        cachedFileData = { isValid: false };
        return cachedFileData;
      }

      const fileDir = path.dirname(filename);

      // Find which boundary (if any) contains this file
      // Uses the first matching boundary if file is inside multiple (shouldn't happen in practice)
      const fileBoundary =
        resolvedBoundaries.find((b) => isInsideDir(b.absDir, filename)) ?? null;

      cachedFileData = { isValid: true, fileDir, fileBoundary };
      return cachedFileData;
    }

    /**
     * Check if a path is inside a directory.
     * Uses path.relative() which is more reliable than string comparison.
     *
     * @param absDir - Absolute directory path
     * @param absPath - Absolute file or directory path to check
     * @returns true if absPath is inside absDir (or is absDir itself)
     *
     * Examples:
     * - isInsideDir('/a/b', '/a/b/file.ts') => true
     * - isInsideDir('/a/b', '/a/b/c/file.ts') => true
     * - isInsideDir('/a/b', '/a/file.ts') => false (../file.ts)
     * - isInsideDir('/a/b', '/a/b') => true (empty relative path)
     */
    function isInsideDir(absDir: string, absPath: string): boolean {
      const rel = path.relative(absDir, absPath);
      // Empty string means paths are the same
      if (rel === '') return true;
      // If relative path starts with '..', it's outside the directory
      // If it's absolute, it's definitely outside
      return !rel.startsWith('..') && !path.isAbsolute(rel);
    }

    /**
     * Check if an import specifier is using an alias.
     *
     * @param spec - Import specifier (e.g., '@entities' or '@entities/army')
     * @param alias - Alias to check against (e.g., '@entities')
     * @returns true if spec matches the alias exactly or is a subpath of it
     *
     * Examples:
     * - isAliasImport('@entities', '@entities') => true
     * - isAliasImport('@entities/army', '@entities') => true
     * - isAliasImport('./army', '@entities') => false
     */
    function isAliasImport(spec: string, alias: string): boolean {
      return spec === alias || spec.startsWith(`${alias}/`);
    }

    /**
     * Check if an import specifier is a relative import.
     *
     * @param spec - Import specifier
     * @returns true if spec starts with '.' (relative import)
     *
     * Examples:
     * - isRelativeImport('./file') => true
     * - isRelativeImport('../parent') => true
     * - isRelativeImport('@entities') => false
     */
    function isRelativeImport(spec: string): boolean {
      return spec.startsWith('.');
    }

    /**
     * Parse a barrel file (index.ts) to extract all exported names.
     * Handles re-exports, direct exports, and default exports.
     * Uses caching and cycle detection to avoid infinite loops.
     *
     * @param barrelFilePath - Absolute path to the barrel file
     * @param visited - Set of already-visited files to detect circular re-exports
     * @returns Set of exported names, or null if file doesn't exist or can't be parsed
     *
     * Supported export patterns:
     * - export * from './module'
     * - export { name1, name2 } from './module'
     * - export function/const/type/etc name
     * - export default
     *
     * Note: This uses regex parsing which is fast but may miss some edge cases.
     * For a production rule, consider using a proper TypeScript parser.
     */
    function parseBarrelExports(
      barrelFilePath: string,
      visited = new Set<string>(),
    ): Set<string> | null {
      // Check cache first
      if (barrelExportsCache.has(barrelFilePath)) {
        return barrelExportsCache.get(barrelFilePath)!;
      }

      // Detect circular re-exports to avoid infinite loops
      // Return empty set (not null) so we know we've seen it but it has no new exports
      if (visited.has(barrelFilePath)) return new Set();
      visited.add(barrelFilePath);

      // File doesn't exist
      if (!fs.existsSync(barrelFilePath)) {
        barrelExportsCache.set(barrelFilePath, null);
        return null;
      }

      try {
        const content = fs.readFileSync(barrelFilePath, 'utf-8');
        const exports = new Set<string>();

        // Pattern 1: export * from './something'
        // Re-exports all exports from another module
        const exportAllRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
        let match: RegExpExecArray | null = exportAllRegex.exec(content);
        while (match !== null) {
          const relativePath = match[1];
          const barrelDir = path.dirname(barrelFilePath);
          const reExportPath = path.resolve(barrelDir, relativePath);

          // Determine the actual file to parse:
          // - If no extension and index.ts exists, use that
          // - If ends with .ts, use as-is
          // - Otherwise, append .ts
          const reExportIndex = path.join(reExportPath, 'index.ts');
          const reExportFile =
            fs.existsSync(reExportIndex) && path.extname(reExportPath) === ''
              ? reExportIndex
              : reExportPath.endsWith('.ts')
                ? reExportPath
                : `${reExportPath}.ts`;

          // Recursively parse the re-exported file
          const reExports = parseBarrelExports(reExportFile, visited);
          if (reExports) {
            for (const name of reExports) {
              exports.add(name);
            }
          }
          match = exportAllRegex.exec(content);
        }

        // Pattern 2: export { name1, name2 } from './something'
        // Re-exports specific named exports, possibly with renaming (as)
        const exportNamedRegex =
          /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
        match = exportNamedRegex.exec(content);
        while (match !== null) {
          // Parse names, handling "name as alias" syntax
          const names = match[1]
            .split(',')
            .map((n) => n.trim())
            .map((n) => {
              // Match "originalName" or "originalName as exportedName"
              const asMatch = n.match(/(\w+)(?:\s+as\s+(\w+))?/);
              // If renamed, use the exported name; otherwise use original
              return asMatch ? asMatch[2] || asMatch[1] : n.trim();
            })
            .filter(Boolean);
          for (const name of names) {
            exports.add(name);
          }
          match = exportNamedRegex.exec(content);
        }

        // Pattern 3: export function/const/type/etc name
        // Direct exports from this file
        const directExportRegex =
          /export\s+(?:async\s+)?(?:function|const|let|var|type|interface|class|enum)\s+(\w+)/g;
        match = directExportRegex.exec(content);
        while (match !== null) {
          exports.add(match[1]);
          match = directExportRegex.exec(content);
        }

        // Pattern 4: export default
        // Default exports are tracked as 'default'
        if (/export\s+default/.test(content)) {
          exports.add('default');
        }

        // Cache the result
        barrelExportsCache.set(barrelFilePath, exports);
        return exports;
      } catch {
        // If parsing fails (permissions, encoding, etc.), cache null
        barrelExportsCache.set(barrelFilePath, null);
        return null;
      }
    }

    /**
     * Extract all imported names from an import node.
     * Handles both named imports and default imports.
     *
     * @param node - AST node for import statement
     * @returns Array of imported names
     *
     * Examples:
     * - import { A, B } from './file' => ['A', 'B']
     * - import C from './file' => ['default'] (if default import)
     */
    function getImportedNames(node: Rule.Node): string[] {
      const names: string[] = [];
      if ('specifiers' in node && Array.isArray(node.specifiers)) {
        for (const spec of node.specifiers) {
          // Named import: import { name } from './file'
          if ('imported' in spec && spec.imported && 'name' in spec.imported) {
            names.push(spec.imported.name);
          }
          // Default import: import name from './file'
          else if ('local' in spec && spec.local && 'name' in spec.local) {
            names.push(spec.local.name);
          }
        }
      }
      return names;
    }

    /**
     * Check if an import specifier is using an alias subpath (e.g., '@entities/army').
     * Subpaths should be converted to the base alias (e.g., '@entities').
     *
     * @param spec - Import specifier to check
     * @returns Object indicating if it's a subpath and which base alias it uses
     *
     * Examples:
     * - checkAliasSubpath('@entities/army') => { isSubpath: true, baseAlias: '@entities' }
     * - checkAliasSubpath('@entities') => { isSubpath: false }
     */
    function checkAliasSubpath(spec: string): {
      isSubpath: boolean;
      baseAlias?: string;
    } {
      for (const b of resolvedBoundaries) {
        if (spec.startsWith(`${b.alias}/`)) {
          return { isSubpath: true, baseAlias: b.alias };
        }
      }
      return { isSubpath: false };
    }

    /**
     * Normalize a relative path to match the actual file system case.
     *
     * CRITICAL: On case-insensitive filesystems (like macOS HFS+), './GameType' and './gameType'
     * resolve to the same file, but on case-sensitive filesystems (Linux, CI), they don't.
     * This function reads the actual directory contents to get the correct case.
     *
     * This prevents false positives when comparing paths and ensures auto-fixes use
     * the correct case that will work on all filesystems.
     *
     * @param relativePath - Relative path to normalize (e.g., './GameType')
     * @param baseDir - Base directory to resolve from
     * @returns Normalized relative path with correct case (e.g., './gameType')
     *
     * Strategy:
     * 1. Resolve to absolute path
     * 2. If exists as file: read directory to find actual filename case
     * 3. If exists as directory: read parent directory to find actual dirname case
     * 4. If doesn't exist: try with .ts extension
     * 5. If all fails: return original (can't normalize)
     */
    function normalizePathCase(relativePath: string, baseDir: string): string {
      if (!relativePath || !baseDir) return relativePath;
      try {
        // Resolve to absolute path
        const absPath = path.resolve(baseDir, relativePath);

        // Case 1: Path exists as a file
        if (fs.existsSync(absPath)) {
          const stat = fs.statSync(absPath);
          if (stat.isFile()) {
            // Read the directory to get the actual filename with correct case
            const dir = path.dirname(absPath);
            const fileName = path.basename(absPath);
            const items = fs.readdirSync(dir);
            // Find the file with matching case-insensitive name
            const actualFileName = items.find(
              (item) => item.toLowerCase() === fileName.toLowerCase(),
            );
            if (actualFileName) {
              const actualPath = path.join(dir, actualFileName);
              return path.relative(baseDir, actualPath);
            }
          }
          // Case 2: Path exists as a directory
          else if (stat.isDirectory()) {
            // Check if there's an index.ts (barrel file)
            const indexPath = path.join(absPath, 'index.ts');
            if (fs.existsSync(indexPath)) {
              // Read parent directory to get actual directory name with correct case
              const parentDir = path.dirname(absPath);
              const dirName = path.basename(absPath);
              const items = fs.readdirSync(parentDir);
              const actualDirName = items.find(
                (item) => item.toLowerCase() === dirName.toLowerCase(),
              );
              if (actualDirName) {
                const actualPath = path.join(parentDir, actualDirName);
                return path.relative(baseDir, actualPath);
              }
            }
          }
        }
        // Case 3: Path doesn't exist - try with .ts extension
        else {
          const tsPath = `${absPath}.ts`;
          if (fs.existsSync(tsPath)) {
            const dir = path.dirname(tsPath);
            const fileName = path.basename(tsPath);
            const items = fs.readdirSync(dir);
            const actualFileName = items.find(
              (item) => item.toLowerCase() === fileName.toLowerCase(),
            );
            if (actualFileName) {
              const actualPath = path.join(dir, actualFileName);
              // Remove .ts extension from result since import doesn't include it
              return path.relative(baseDir, actualPath).replace(/\.ts$/, '');
            }
          }
        }
      } catch {
        // If we can't normalize (permissions, etc.), return original
        // Better to use original than fail completely
      }
      return relativePath;
    }

    /**
     * Normalize a relative path for barrel file imports.
     * Ensures consistent path format and prevents circular dependency indicators.
     *
     * @param relativePath - Relative path to normalize
     * @returns Normalized path, or empty string if path is invalid
     *
     * Rules:
     * - Never returns './' or '../' (indicates circular dependency)
     * - Always returns a specific path (file or subdirectory)
     * - Normalizes path separators to forward slashes
     * - Removes trailing slashes
     * - Ensures paths start with './' if they don't start with '.' or '..'
     *
     * Examples:
     * - normalizeBarrelPath('../parent') => '../parent'
     * - normalizeBarrelPath('./sibling') => './sibling'
     * - normalizeBarrelPath('sibling') => './sibling'
     * - normalizeBarrelPath('.') => '' (invalid - would be circular)
     */
    function normalizeBarrelPath(relativePath: string): string {
      // Normalize path separators (Windows vs Unix)
      const normalized = relativePath
        .split(path.sep)
        .join('/')
        .replace(/^\.\./, '..')
        .replace(/^\.$/, '.');

      // Never return just './' or '../' - those indicate circular dependencies
      // Always return a specific path (file or subdirectory)
      if (normalized === '' || normalized === '.') {
        // This shouldn't happen - means we're importing from current directory
        // Should import from file directly, not barrel
        // Return empty string to indicate error rather than './'
        return '';
      }

      // Parent path (../something) - remove trailing slash if present
      if (normalized.startsWith('..')) {
        return normalized.replace(/\/$/, '');
      }

      // Relative path starting with . (./something) - remove trailing slash
      if (normalized.startsWith('.')) {
        return normalized.replace(/\/$/, '');
      }

      // Path doesn't start with . or .. - it's a sibling, so prepend ./
      return `./${normalized}`.replace(/\/$/, '');
    }

    /**
     * Find the nearest barrel file that exports a given name, working up the directory tree.
     *
     * This implements the "find nearest export" strategy:
     * 1. Start at the current directory
     * 2. Check if current directory's index.ts exports the name
     * 3. If found, determine if it's from a file or subdirectory
     * 4. If not found or circular, move to parent directory
     * 5. Repeat until we reach boundary root or find the export
     *
     * @param exportName - Name of the export to find (e.g., 'Army')
     * @param startDir - Directory to start searching from (current file's directory)
     * @param boundaryRoot - Root of the boundary (stop searching beyond this)
     * @param currentFilePath - Path to current file (for circular dependency detection)
     * @returns Relative import path to the export, or null if not found
     *
     * Strategy for determining import path:
     * - If export is in a file in current directory: return './filename'
     * - If export is in a subdirectory barrel: return './subdir'
     * - If export is only in parent barrel: return '../parent' or '../'
     * - If circular dependency detected: skip and move up
     *
     * Edge cases handled:
     * - Circular dependencies (file imports itself through barrel)
     * - Case-sensitive file names
     * - Exports in subdirectories vs files
     * - Exports only available through parent barrels
     */
    function findNearestExportPath(
      exportName: string,
      startDir: string,
      boundaryRoot: string,
      currentFilePath?: string,
    ): string | null {
      // Get the current file's export name to detect circular dependencies
      // If we're importing from a barrel that also exports the current file,
      // that's a circular dependency and we should skip it
      let currentFileExportName: string | null = null;
      if (currentFilePath) {
        currentFileExportName = path.basename(currentFilePath, '.ts');
      }

      let currentDir = startDir;

      // Search up the directory tree until we reach boundary root
      // We use startsWith to handle cases where boundaryRoot is a parent
      while (
        currentDir.startsWith(boundaryRoot) ||
        currentDir === boundaryRoot
      ) {
        // Check if current directory has a barrel file
        const currentIndex = path.join(currentDir, 'index.ts');
        if (fs.existsSync(currentIndex)) {
          const exports = parseBarrelExports(currentIndex);
          if (exports && exports.has(exportName)) {
            // Found the export in this barrel!
            // Now determine the actual source: file or subdirectory?

            const isCircular =
              currentFileExportName && exports.has(currentFileExportName);

            // Search for the actual source of the export
            try {
              const items = fs.readdirSync(currentDir, { withFileTypes: true });

              // Strategy 1: Check if it's exported from a file in this directory
              // We read each file to find which one actually exports the name
              // This handles cases where file name doesn't match export name
              let actualFileName: string | null = null;
              for (const item of items) {
                if (item.isFile() && item.name.endsWith('.ts')) {
                  const baseName = item.name.replace(/\.ts$/, '');
                  const itemPath = path.join(currentDir, item.name);
                  try {
                    const content = fs.readFileSync(itemPath, 'utf-8');
                    // Check if this file directly exports the name
                    const exportRegex = new RegExp(
                      `export\\s+(?:async\\s+)?(?:function|const|let|var|type|interface|class|enum)\\s+${exportName}\\b`,
                    );
                    if (exportRegex.test(content)) {
                      actualFileName = baseName;
                      break;
                    }
                  } catch {
                    // Can't read file, skip it
                  }
                }
              }

              // If we found the file, return path to that file
              if (actualFileName) {
                const exportFile = path.join(
                  currentDir,
                  `${actualFileName}.ts`,
                );
                const relativePath = path
                  .relative(startDir, exportFile)
                  .replace(/\.ts$/, '');
                // Ensure path starts with . for relative imports
                return relativePath.startsWith('.')
                  ? relativePath
                  : `./${relativePath}`;
              }

              // Strategy 2: Check if it's in a subdirectory barrel
              // Subdirectories can have their own index.ts that exports the name
              for (const item of items) {
                if (item.isDirectory()) {
                  const subdirIndex = path.join(
                    currentDir,
                    item.name,
                    'index.ts',
                  );
                  if (fs.existsSync(subdirIndex)) {
                    const subdirExports = parseBarrelExports(subdirIndex);
                    if (subdirExports && subdirExports.has(exportName)) {
                      // Check for circular dependency in subdirectory
                      // (even if parent is circular, subdirectory might be fine)
                      if (
                        currentFileExportName &&
                        subdirExports.has(currentFileExportName)
                      ) {
                        continue; // Skip circular subdirectory
                      }
                      // Found in subdirectory - import from that directory
                      const subdirPath = path.join(currentDir, item.name);
                      return normalizeBarrelPath(
                        path.relative(startDir, subdirPath),
                      );
                    }
                  }
                }
              }
            } catch {
              // Can't read directory, skip to next level
            }

            // Export is in the barrel but we couldn't find the source file/directory
            // This can happen if:
            // 1. The export is re-exported from a parent barrel
            // 2. There's a circular dependency
            // 3. The file structure doesn't match what we expect

            // If circular, we can't use this barrel - move up
            if (isCircular) {
              const parentDir = path.dirname(currentDir);
              if (parentDir === currentDir) break; // Can't go up further
              currentDir = parentDir;
              continue;
            }

            // Not circular, so we can import from the barrel directory itself
            // This means the export is available through this barrel
            const relativePath = normalizeBarrelPath(
              path.relative(startDir, currentDir),
            );

            // If normalizeBarrelPath returns empty, we're at the same directory
            // This shouldn't happen if we found the export, but handle it gracefully
            if (!relativePath) {
              // Move up and continue searching
              const parentDir = path.dirname(currentDir);
              if (parentDir === currentDir) break;
              currentDir = parentDir;
              continue;
            }
            return relativePath;
          }
        }

        // Export not found in this directory's barrel, move up one level
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break; // Reached filesystem root
        currentDir = parentDir;
      }

      // Export not found anywhere in the boundary
      return null;
    }

    /**
     * Calculate the correct relative import path when converting from alias to relative.
     *
     * Strategy:
     * 1. For each imported name, find the nearest export path
     * 2. If all exports are from the same path, use that path
     * 3. If exports are from different paths, fall back to boundary root barrel
     *
     * @param fileDir - Directory of the file doing the import
     * @param fileBoundary - Boundary the file belongs to
     * @param node - Import node (to extract imported names)
     * @param currentFilePath - Current file path (for circular dependency detection)
     * @returns Relative import path to use
     *
     * Examples:
     * - If importing { Army, Unit } and both are in './army', returns './army'
     * - If importing { Army } from './army' and { Unit } from './unit', returns '../' (boundary root)
     * - If can't find exports, returns '../' (boundary root as fallback)
     */
    function calculateRelativePath(
      fileDir: string,
      fileBoundary: Boundary,
      node: Rule.Node,
      currentFilePath?: string,
    ): string {
      const importedNames = getImportedNames(node);

      // Try to find the nearest export path for each imported name
      // If all are from the same path, we can use that specific path
      if (importedNames.length > 0) {
        const exportPaths = new Set<string>();
        for (const exportName of importedNames) {
          const exportPath = findNearestExportPath(
            exportName,
            fileDir,
            fileBoundary.absDir,
            currentFilePath,
          );
          if (exportPath) {
            exportPaths.add(exportPath);
          }
        }

        // If all exports are from the same path, use that specific path
        // This is the optimal case - we can import directly from the source
        if (exportPaths.size === 1) {
          const [importPath] = exportPaths;
          if (importPath) {
            return importPath;
          }
        }
        // If exports.size > 1, exports are from different paths
        // We'll fall back to boundary root (see below)
      }

      // Fallback: can't find exports or they're split across multiple paths
      // Use the boundary root barrel as a safe fallback
      // This ensures the import will work even if we can't determine exact paths
      return normalizeBarrelPath(path.relative(fileDir, fileBoundary.absDir));
    }

    /**
     * Create a fixer function to replace an import path.
     * Handles different import node types: ImportDeclaration, ImportExpression, require().
     *
     * @param node - AST node for the import
     * @param newPath - New import path to use
     * @returns Fixer function, or null if node type is unsupported
     */
    function createFixer(
      node: Rule.Node,
      newPath: string,
    ): Rule.ReportFixer | null {
      return (fixer) => {
        // Case 1: Standard import statement (import ... from 'path')
        if ('source' in node && node.source) {
          return fixer.replaceText(node.source as Rule.Node, `'${newPath}'`);
        }
        // Case 2: Dynamic import or require() call
        if (
          'arguments' in node &&
          Array.isArray(node.arguments) &&
          node.arguments[0]
        ) {
          return fixer.replaceText(
            node.arguments[0] as Rule.Node,
            `'${newPath}'`,
          );
        }
        // Unsupported node type
        return null;
      };
    }

    /**
     * Main handler for all import statements.
     * Analyzes the import and reports violations with auto-fixes.
     *
     * @param node - AST node for the import (ImportDeclaration, ImportExpression, or CallExpression)
     * @param rawSpec - Raw import specifier string (e.g., '@entities', './file', '../parent')
     *
     * Processing order:
     * 1. Check for alias subpaths (e.g., '@entities/army' -> '@entities')
     * 2. If file is inside a boundary:
     *    a. Check if using own alias (should use relative)
     *    b. Check if relative import goes outside boundary (should use alias)
     *    c. Check if relative import can be optimized (find nearest export)
     * 3. If file is outside all boundaries:
     *    a. Check if relative import targets a boundary (should use alias)
     */
    function handleImport(node: Rule.Node, rawSpec: string): void {
      const fileData = getFileData();
      // Skip if we can't determine file location
      if (!fileData.isValid) return;

      // CHECK 0: Alias subpaths (e.g., '@entities/army')
      // Subpaths should be converted to base alias (e.g., '@entities')
      // This enforces using barrel files instead of direct subpath imports
      const subpathCheck = checkAliasSubpath(rawSpec);
      if (subpathCheck.isSubpath && subpathCheck.baseAlias) {
        context.report({
          node,
          messageId: 'mustUseBarrelFile',
          data: { alias: subpathCheck.baseAlias, spec: rawSpec },
          fix: createFixer(node, subpathCheck.baseAlias),
        });
        return;
      }

      const { fileDir, fileBoundary } = fileData;
      if (!fileDir) return;

      // ========================================================================
      // CASE 1: File is inside a boundary
      // ========================================================================
      // When inside a boundary, we enforce:
      // - Use relative imports for same-boundary imports
      // - Use aliases for cross-boundary imports
      // - Optimize relative paths to find nearest exports
      if (fileBoundary) {
        // CHECK 1: Forbid using boundary's own alias inside the boundary
        // Example: File in domain/entities/army/army.ts using '@entities'
        // Should use: './army' or '../game' (relative) instead
        if (isAliasImport(rawSpec, fileBoundary.alias)) {
          const filename = context.filename ?? context.getFilename?.() ?? '';
          const relativePath = calculateRelativePath(
            fileDir,
            fileBoundary,
            node,
            filename,
          );

          // If calculateRelativePath returns empty, we can't determine the correct path
          if (!relativePath) {
            context.report({
              node,
              messageId: 'mustUseRelativeInside',
              data: { dir: fileBoundary.dir, alias: fileBoundary.alias },
              // Don't auto-fix if we can't determine the correct path
            });
            return;
          }

          // Check if there's already an import from the target path
          // If so, we should remove this import instead of fixing it
          const currentSpecifiers =
            'specifiers' in node && Array.isArray(node.specifiers)
              ? node.specifiers
              : [];
          const currentNames = new Set(
            currentSpecifiers
              .map((s) =>
                'imported' in s && s.imported && 'name' in s.imported
                  ? String(s.imported.name)
                  : null,
              )
              .filter((n): n is string => n !== null),
          );

          const hasExistingImport = importDeclarations.some(
            (imp) =>
              imp.source === relativePath &&
              imp.node !== node &&
              // Check if all current names are in existing import
              Array.from(currentNames).every((name) =>
                imp.importedNames.has(name),
              ),
          );

          if (hasExistingImport) {
            // Remove this duplicate import instead of fixing it
            context.report({
              node,
              messageId: 'mustUseRelativeInside',
              data: { dir: fileBoundary.dir, alias: fileBoundary.alias },
              fix: (fixer) => fixer.remove(node),
            });
          } else if (relativePath !== rawSpec) {
            // Only report if the path is different from current
            context.report({
              node,
              messageId: 'mustUseRelativeInside',
              data: { dir: fileBoundary.dir, alias: fileBoundary.alias },
              fix: createFixer(node, relativePath),
            });
          }
          return;
        }

        // CHECK 2: Relative imports must stay within boundary
        // If a relative import goes outside the boundary, it should use an alias instead
        // Example: File in domain/entities using '../queries/getLine'
        // Should use: '@queries' instead
        if (isRelativeImport(rawSpec)) {
          const targetAbs = path.resolve(fileDir, rawSpec);
          const targetIsInsideBoundary = isInsideDir(
            fileBoundary.absDir,
            targetAbs,
          );

          // Target is outside the boundary - this is a violation
          if (!targetIsInsideBoundary) {
            // Check if the target path actually exists
            const targetExists =
              fs.existsSync(targetAbs) || fs.existsSync(`${targetAbs}.ts`);

            // Before reporting as outside boundary, try to find the correct path within boundary
            const importedNames = getImportedNames(node);
            if (importedNames.length > 0) {
              const filename =
                context.filename ?? context.getFilename?.() ?? '';
              // Try to find the correct path for each export
              const exportPaths = new Set<string>();
              const missingExports: string[] = [];
              for (const exportName of importedNames) {
                const exportPath = findNearestExportPath(
                  exportName,
                  fileDir,
                  fileBoundary.absDir,
                  filename,
                );
                if (exportPath) {
                  exportPaths.add(exportPath);
                } else {
                  missingExports.push(exportName);
                }
              }

              // If we found paths for some exports but not others, report missing exports
              if (missingExports.length > 0 && exportPaths.size > 0) {
                context.report({
                  node,
                  messageId: 'exportNotFound',
                  data: {
                    exportName: missingExports.join(', '),
                    spec: rawSpec,
                  },
                });
                return;
              }

              // If all exports are from the same path within boundary, suggest that
              if (exportPaths.size === 1) {
                const [correctPath] = exportPaths;
                if (correctPath && correctPath !== rawSpec) {
                  // Verify the suggested path actually exists
                  const suggestedAbs = path.resolve(fileDir, correctPath);
                  const suggestedExists =
                    fs.existsSync(suggestedAbs) ||
                    fs.existsSync(`${suggestedAbs}.ts`) ||
                    fs.existsSync(path.join(suggestedAbs, 'index.ts'));

                  if (suggestedExists) {
                    // Found a correct path within the boundary - suggest that instead
                    context.report({
                      node,
                      messageId: 'mustUseBarrelFileRelative',
                      data: {
                        barrelPath: correctPath,
                        spec: rawSpec,
                      },
                      fix: createFixer(node, correctPath),
                    });
                    return;
                  }
                }
              }

              // If we couldn't find any exports and the path doesn't exist, report that
              if (exportPaths.size === 0 && !targetExists) {
                // Try to suggest a path based on the import name (e.g., if importing from '../gameEffects', try './gameEffects')
                const suggestedPath = rawSpec.startsWith('../')
                  ? rawSpec.replace(/^\.\.\//, './')
                  : null;
                let suggestedExists = false;
                let finalSuggestedPath = suggestedPath;

                if (suggestedPath && path.isAbsolute(fileDir)) {
                  // Remove trailing slash if present for checking
                  const cleanPath = suggestedPath.replace(/\/$/, '');
                  const suggestedAbs = path.resolve(fileDir, cleanPath);

                  // Check if it exists as a directory with index.ts, or as a file
                  if (fs.existsSync(suggestedAbs)) {
                    try {
                      const stat = fs.statSync(suggestedAbs);
                      if (stat.isDirectory()) {
                        if (
                          fs.existsSync(path.join(suggestedAbs, 'index.ts'))
                        ) {
                          suggestedExists = true;
                          finalSuggestedPath = cleanPath;
                        }
                      } else {
                        suggestedExists = true; // It's a file
                        finalSuggestedPath = cleanPath;
                      }
                    } catch {
                      // stat failed, check as file
                      suggestedExists = fs.existsSync(`${suggestedAbs}.ts`);
                    }
                  } else if (fs.existsSync(`${suggestedAbs}.ts`)) {
                    // Check if it's a .ts file
                    suggestedExists = true;
                    finalSuggestedPath = cleanPath;
                  }
                }

                // Report the error - if we found a valid path, suggest it; otherwise just report the issue
                context.report({
                  node,
                  messageId: 'pathNotFound',
                  data: {
                    spec: rawSpec,
                    expectedPath:
                      suggestedExists && finalSuggestedPath
                        ? finalSuggestedPath
                        : 'a valid path within the boundary',
                  },
                  fix:
                    suggestedExists && finalSuggestedPath
                      ? createFixer(node, finalSuggestedPath)
                      : undefined,
                });
                return;
              }
            }

            // Can't find correct path within boundary - must be from outside
            const targetBoundary =
              resolvedBoundaries.find(
                (b) => b !== fileBoundary && isInsideDir(b.absDir, targetAbs),
              ) ?? null;

            if (targetBoundary) {
              context.report({
                node,
                messageId: 'mustUseAliasFromOutside',
                data: {
                  dir: targetBoundary.dir,
                  alias: targetBoundary.alias,
                },
                fix: createFixer(node, targetBoundary.alias),
              });
            } else if (!targetExists) {
              // Path doesn't exist and isn't in any boundary
              context.report({
                node,
                messageId: 'pathNotFound',
                data: {
                  spec: rawSpec,
                  expectedPath: 'a valid path',
                },
              });
            } else {
              // Path exists but we can't determine the correct boundary
              context.report({
                node,
                messageId: 'mustUseAliasFromOutside',
                data: {
                  dir: fileBoundary.dir,
                  alias: 'an appropriate alias',
                },
              });
            }
            return;
          }

          // CHECK 3: Optimize same-boundary relative imports
          // Rule: "Find nearest export" - use the closest path that exports what we need
          // - Same directory: import directly from file (./filename), not barrel (./)
          // - Sibling directory: use barrel (./sibling) or specific file if all exports from one file
          // - Parent/ancestor: use barrel (../, ../../) if no circular dependency
          // - Multiple sources: split imports if exports come from different paths
          const importedNames = getImportedNames(node);
          if (importedNames.length > 0) {
            const filename = context.filename ?? context.getFilename?.() ?? '';

            // First check: if importing from same directory barrel (./), should import from file instead
            if (rawSpec === './' || rawSpec === '.') {
              // Use findNearestExportPath to find which file actually contains the export
              // This handles cases where the file name doesn't match the export name
              const exportPaths = new Map<string, string>();
              for (const exportName of importedNames) {
                const exportPath = findNearestExportPath(
                  exportName,
                  fileDir,
                  fileBoundary.absDir,
                  filename,
                );
                if (exportPath && exportPath !== './' && exportPath !== '.') {
                  exportPaths.set(exportName, exportPath);
                }
              }

              // If all exports are from the same file, suggest that file
              if (exportPaths.size > 0) {
                const uniquePaths = new Set(exportPaths.values());
                if (uniquePaths.size === 1) {
                  const [filePath] = uniquePaths;
                  // Make sure it's a file path, not a directory (no trailing slash)
                  const cleanPath = filePath.replace(/\/$/, '');
                  if (cleanPath && cleanPath !== './' && cleanPath !== '.') {
                    context.report({
                      node,
                      messageId: 'mustUseBarrelFileRelative',
                      data: { barrelPath: cleanPath, spec: rawSpec },
                      fix: createFixer(node, cleanPath),
                    });
                    return;
                  }
                }
              }
            }

            // Second check: find nearest path for each export individually, then group by path
            const exportPaths = new Map<string, string>();
            for (const exportName of importedNames) {
              const exportPath = findNearestExportPath(
                exportName,
                fileDir,
                fileBoundary.absDir,
                filename,
              );
              if (exportPath) {
                exportPaths.set(exportName, exportPath);
              }
            }

            if (exportPaths.size === 0) {
              // Couldn't find exports - skip
              return;
            }

            // Group exports by their import path
            const exportsByPath = new Map<string, string[]>();
            for (const [exportName, exportPath] of exportPaths) {
              if (!exportsByPath.has(exportPath)) {
                exportsByPath.set(exportPath, []);
              }
              exportsByPath.get(exportPath)!.push(exportName);
            }

            // Strategy: Split imports first, then resolve each individually
            // If exports are in different paths, we need to split them
            if (exportsByPath.size > 1) {
              // Exports are in different paths - auto-split them
              // Create a fixer that splits the import into multiple statements
              const fix = (fixer: Rule.RuleFixer) => {
                const fixes: Rule.Fix[] = [];
                const specifiers =
                  'specifiers' in node && Array.isArray(node.specifiers)
                    ? node.specifiers
                    : [];

                // Group specifiers by their import path
                const specifiersByPath = new Map<
                  string,
                  Array<(typeof specifiers)[number]>
                >();
                for (const spec of specifiers) {
                  const specName =
                    'imported' in spec && spec.imported
                      ? 'name' in spec.imported
                        ? String(spec.imported.name)
                        : 'value' in spec.imported
                          ? String(spec.imported.value)
                          : null
                      : null;

                  if (specName) {
                    const exportPath = exportPaths.get(specName);
                    if (exportPath) {
                      if (!specifiersByPath.has(exportPath)) {
                        specifiersByPath.set(exportPath, []);
                      }
                      specifiersByPath.get(exportPath)!.push(spec);
                    }
                  }
                }

                // Remove the original import
                fixes.push(fixer.remove(node));

                // Create a new import statement for each path group
                for (const [importPath, pathSpecifiers] of specifiersByPath) {
                  if (pathSpecifiers.length > 0) {
                    // Build the import statement
                    const importNames = pathSpecifiers
                      .map((spec) => {
                        const imported =
                          'imported' in spec && spec.imported
                            ? 'name' in spec.imported
                              ? String(spec.imported.name)
                              : 'value' in spec.imported
                                ? String(spec.imported.value)
                                : null
                            : null;
                        const local =
                          'local' in spec && spec.local
                            ? 'name' in spec.local
                              ? String(spec.local.name)
                              : null
                            : null;
                        if (imported && local && imported !== local) {
                          return `${imported} as ${local}`;
                        }
                        return imported;
                      })
                      .filter((n): n is string => n !== null)
                      .join(', ');

                    // Check if this is a type import
                    const isTypeImport =
                      'importKind' in node && node.importKind === 'type';

                    const importType = isTypeImport ? 'import type' : 'import';
                    const newImport = `${importType} { ${importNames} } from '${importPath}';\n`;
                    fixes.push(fixer.insertTextBefore(node, newImport));
                  }
                }

                return fixes;
              };

              // Report that imports should be split
              context.report({
                node,
                messageId: 'mustUseBarrelFileRelative',
                data: {
                  barrelPath: Array.from(exportsByPath.keys())[0]!,
                  spec: rawSpec,
                },
                fix,
              });
              return;
            }

            // All exports are from the same path - check if it matches current spec
            if (exportsByPath.size === 1) {
              const [importPath, exports] = exportsByPath.entries().next()
                .value as [string, string[]];
              // Normalize both paths for case-insensitive filesystem comparison
              // On macOS, './GameType' and './gameType' resolve to the same file
              const normalizedImportPath = normalizePathCase(
                importPath,
                fileDir,
              );
              const normalizedRawSpec = normalizePathCase(rawSpec, fileDir);

              // Check if all imported names are in this path
              // Only report if paths are actually different (after normalization)
              if (
                importPath &&
                normalizedImportPath !== normalizedRawSpec &&
                exports.length === importedNames.length
              ) {
                // All exports are from the same path - suggest that path
                context.report({
                  node,
                  messageId: 'mustUseBarrelFileRelative',
                  data: { barrelPath: importPath, spec: rawSpec },
                  fix: createFixer(node, importPath),
                });
                return;
              }
            }
          }
        }
        return;
      }

      // ========================================================================
      // CASE 2: File is outside all boundaries
      // ========================================================================
      // Files outside boundaries (e.g., root-level config files) should use
      // aliases when importing from boundaries, not relative paths.
      // This maintains clear boundaries even from external files.
      if (!fileBoundary && isRelativeImport(rawSpec)) {
        const targetAbs = path.resolve(fileDir, rawSpec);
        // Check if the target is inside any boundary
        const targetBoundary = resolvedBoundaries.find((b) =>
          isInsideDir(b.absDir, targetAbs),
        );

        // If target is in a boundary, should use alias instead of relative path
        if (targetBoundary) {
          context.report({
            node,
            messageId: 'mustUseAliasFromOutside',
            data: { dir: targetBoundary.dir, alias: targetBoundary.alias },
            fix: createFixer(node, targetBoundary.alias),
          });
        }
      }
    }

    // ========================================================================
    // ESLint Rule Visitor Functions
    // ========================================================================
    // These functions are called by ESLint as it traverses the AST
    return {
      /**
       * Called once per file, before processing any imports.
       * Used to:
       * 1. Clear caches (file data, barrel exports)
       * 2. Collect all import declarations for duplicate detection
       */
      Program(programNode) {
        // Clear caches for new file
        cachedFileData = null;
        barrelExportsCache.clear();
        importDeclarations.length = 0;

        // Collect all import declarations in this file
        // This allows us to detect duplicate imports when auto-fixing
        if ('body' in programNode && Array.isArray(programNode.body)) {
          for (const stmt of programNode.body) {
            if (
              stmt.type === 'ImportDeclaration' &&
              'source' in stmt &&
              stmt.source &&
              'value' in stmt.source
            ) {
              const source = String(stmt.source.value);
              const specifiers =
                'specifiers' in stmt && Array.isArray(stmt.specifiers)
                  ? stmt.specifiers
                  : [];
              // Extract all imported names from this import
              const importedNames = new Set<string>(
                specifiers
                  .map((s) =>
                    'imported' in s && s.imported && 'name' in s.imported
                      ? String(s.imported.name)
                      : null,
                  )
                  .filter((n): n is string => n !== null),
              );
              importDeclarations.push({
                node: stmt,
                source,
                importedNames,
              });
            }
          }
        }
      },

      /**
       * Handle standard ES6 import statements: import ... from 'path'
       */
      ImportDeclaration(node) {
        const spec = (node.source as { value?: string })?.value;
        if (typeof spec === 'string') {
          handleImport(node, spec);
        }
      },

      /**
       * Handle dynamic import() expressions: import('path')
       */
      ImportExpression(node) {
        const arg = node.source;
        if (arg?.type === 'Literal' && typeof arg.value === 'string') {
          handleImport(node, arg.value);
        }
      },

      /**
       * Handle CommonJS require() calls: require('path')
       */
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length === 1 &&
          node.arguments[0]?.type === 'Literal' &&
          typeof node.arguments[0].value === 'string'
        ) {
          handleImport(node, node.arguments[0].value);
        }
      },
    };
  },
};

export default rule;
