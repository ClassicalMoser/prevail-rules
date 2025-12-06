import type { Rule } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

interface Boundary {
  dir: string;
  alias: string;
  absDir: string;
}

interface FileData {
  isValid: boolean;
  fileDir?: string;
  fileBoundary?: Boundary | null;
}

interface RuleOptions {
  rootDir?: string;
  boundaries: Array<{ dir: string; alias: string }>;
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
    const [{ rootDir = 'src', boundaries }] = context.options as [RuleOptions];
    const cwd = context.getCwd?.() ?? process.cwd();
    const resolvedBoundaries: Boundary[] = boundaries.map((b) => ({
      ...b,
      absDir: path.resolve(cwd, rootDir, b.dir),
    }));

    let cachedFileData: FileData | null = null;
    const barrelExportsCache = new Map<string, Set<string> | null>();

    // Track all import declarations in the current file
    const importDeclarations: Array<{
      node: unknown;
      source: string;
      importedNames: Set<string>;
    }> = [];

    function getFileData(): FileData {
      if (cachedFileData) return cachedFileData;

      const filename =
        context.filename ?? context.getFilename?.() ?? '<unknown>';
      if (!path.isAbsolute(filename)) {
        cachedFileData = { isValid: false };
        return cachedFileData;
      }

      const fileDir = path.dirname(filename);
      const fileBoundary =
        resolvedBoundaries.find((b) => isInsideDir(b.absDir, filename)) ?? null;

      cachedFileData = { isValid: true, fileDir, fileBoundary };
      return cachedFileData;
    }

    function isInsideDir(absDir: string, absPath: string): boolean {
      const rel = path.relative(absDir, absPath);
      if (rel === '') return true;
      return !rel.startsWith('..') && !path.isAbsolute(rel);
    }

    function isAliasImport(spec: string, alias: string): boolean {
      return spec === alias || spec.startsWith(`${alias}/`);
    }

    function isRelativeImport(spec: string): boolean {
      return spec.startsWith('.');
    }

    function parseBarrelExports(
      barrelFilePath: string,
      visited = new Set<string>(),
    ): Set<string> | null {
      if (barrelExportsCache.has(barrelFilePath)) {
        return barrelExportsCache.get(barrelFilePath)!;
      }

      if (visited.has(barrelFilePath)) return new Set();
      visited.add(barrelFilePath);

      if (!fs.existsSync(barrelFilePath)) {
        barrelExportsCache.set(barrelFilePath, null);
        return null;
      }

      try {
        const content = fs.readFileSync(barrelFilePath, 'utf-8');
        const exports = new Set<string>();

        // export * from './something'
        const exportAllRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
        let match: RegExpExecArray | null = exportAllRegex.exec(content);
        while (match !== null) {
          const relativePath = match[1];
          const barrelDir = path.dirname(barrelFilePath);
          const reExportPath = path.resolve(barrelDir, relativePath);
          // If the path has no extension, it's a directory - check for index.ts in that directory
          const reExportIndex = path.join(reExportPath, 'index.ts');
          const reExportFile =
            fs.existsSync(reExportIndex) && path.extname(reExportPath) === ''
              ? reExportIndex
              : reExportPath.endsWith('.ts')
                ? reExportPath
                : `${reExportPath}.ts`;

          const reExports = parseBarrelExports(reExportFile, visited);
          if (reExports) {
            for (const name of reExports) {
              exports.add(name);
            }
          }
          match = exportAllRegex.exec(content);
        }

        // export { name1, name2 } from './something'
        const exportNamedRegex =
          /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
        match = exportNamedRegex.exec(content);
        while (match !== null) {
          const names = match[1]
            .split(',')
            .map((n) => n.trim())
            .map((n) => {
              const asMatch = n.match(/(\w+)(?:\s+as\s+(\w+))?/);
              return asMatch ? asMatch[2] || asMatch[1] : n.trim();
            })
            .filter(Boolean);
          for (const name of names) {
            exports.add(name);
          }
          match = exportNamedRegex.exec(content);
        }

        // export function/const/type/etc name
        const directExportRegex =
          /export\s+(?:async\s+)?(?:function|const|let|var|type|interface|class|enum)\s+(\w+)/g;
        match = directExportRegex.exec(content);
        while (match !== null) {
          exports.add(match[1]);
          match = directExportRegex.exec(content);
        }

        if (/export\s+default/.test(content)) {
          exports.add('default');
        }

        barrelExportsCache.set(barrelFilePath, exports);
        return exports;
      } catch {
        barrelExportsCache.set(barrelFilePath, null);
        return null;
      }
    }

    function getImportedNames(node: Rule.Node): string[] {
      const names: string[] = [];
      if ('specifiers' in node && Array.isArray(node.specifiers)) {
        for (const spec of node.specifiers) {
          if ('imported' in spec && spec.imported && 'name' in spec.imported) {
            names.push(spec.imported.name);
          } else if ('local' in spec && spec.local && 'name' in spec.local) {
            names.push(spec.local.name);
          }
        }
      }
      return names;
    }

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
     * On case-insensitive filesystems (like macOS), this ensures we compare
     * paths correctly by resolving to the actual file name.
     */
    function normalizePathCase(relativePath: string, baseDir: string): string {
      if (!relativePath || !baseDir) return relativePath;
      try {
        // Resolve to absolute path
        const absPath = path.resolve(baseDir, relativePath);
        // Check if it's a file
        if (fs.existsSync(absPath)) {
          const stat = fs.statSync(absPath);
          if (stat.isFile()) {
            // Get the actual file name from the directory
            const dir = path.dirname(absPath);
            const fileName = path.basename(absPath);
            const items = fs.readdirSync(dir);
            const actualFileName = items.find(
              (item) => item.toLowerCase() === fileName.toLowerCase(),
            );
            if (actualFileName) {
              const actualPath = path.join(dir, actualFileName);
              return path.relative(baseDir, actualPath);
            }
          } else if (stat.isDirectory()) {
            // For directories, check if there's an index.ts
            const indexPath = path.join(absPath, 'index.ts');
            if (fs.existsSync(indexPath)) {
              // Get the actual directory name
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
        } else {
          // File doesn't exist - try with .ts extension
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
              return path.relative(baseDir, actualPath).replace(/\.ts$/, '');
            }
          }
        }
      } catch {
        // If we can't normalize, return original
      }
      return relativePath;
    }

    function normalizeBarrelPath(relativePath: string): string {
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
        // Return null to indicate error rather than './'
        return '';
      }
      if (normalized.startsWith('..')) {
        // Already a parent path - remove trailing slash if present
        return normalized.replace(/\/$/, '');
      }
      if (normalized.startsWith('.')) {
        // Already a relative path (sibling or same directory)
        return normalized.replace(/\/$/, '');
      }
      // Path doesn't start with . or .. - it's a sibling, so prepend ./
      return `./${normalized}`.replace(/\/$/, '');
    }

    /**
     * Find the nearest barrel that has an export, working up the directory tree.
     * Strategy: Check current barrel, then parent, then grandparent, etc.
     * If found in a barrel, determine if it's from a file or directory and return the appropriate path.
     * Returns the import path (file path or barrel path).
     */
    function findNearestExportPath(
      exportName: string,
      startDir: string,
      boundaryRoot: string,
      currentFilePath?: string,
    ): string | null {
      // Get the current file's export name to avoid circular dependencies
      let currentFileExportName: string | null = null;
      if (currentFilePath) {
        currentFileExportName = path.basename(currentFilePath, '.ts');
      }

      let currentDir = startDir;

      while (
        currentDir.startsWith(boundaryRoot) ||
        currentDir === boundaryRoot
      ) {
        // Check barrel in current directory
        const currentIndex = path.join(currentDir, 'index.ts');
        if (fs.existsSync(currentIndex)) {
          const exports = parseBarrelExports(currentIndex);
          if (exports && exports.has(exportName)) {
            const isCircular =
              currentFileExportName && exports.has(currentFileExportName);

            // Found in barrel! Now determine if it's from a file or directory
            // Check files and directories in this barrel's directory
            try {
              const items = fs.readdirSync(currentDir, { withFileTypes: true });

              // Check if it's a file in this directory
              // First, try to find the actual file name (case-sensitive) by reading the directory
              let actualFileName: string | null = null;
              for (const item of items) {
                if (item.isFile() && item.name.endsWith('.ts')) {
                  const baseName = item.name.replace(/\.ts$/, '');
                  // Check if this file exports the name we're looking for
                  const itemPath = path.join(currentDir, item.name);
                  try {
                    const content = fs.readFileSync(itemPath, 'utf-8');
                    const exportRegex = new RegExp(
                      `export\\s+(?:async\\s+)?(?:function|const|let|var|type|interface|class|enum)\\s+${exportName}\\b`,
                    );
                    if (exportRegex.test(content)) {
                      actualFileName = baseName;
                      break;
                    }
                  } catch {
                    // Can't read, skip
                  }
                }
              }

              // If we found a file, use it (with correct case)
              if (actualFileName) {
                const exportFile = path.join(
                  currentDir,
                  `${actualFileName}.ts`,
                );
                const relativePath = path
                  .relative(startDir, exportFile)
                  .replace(/\.ts$/, '');
                return relativePath.startsWith('.')
                  ? relativePath
                  : `./${relativePath}`;
              }

              // Check if it's in a subdirectory barrel
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
                      // Skip if circular
                      if (
                        currentFileExportName &&
                        subdirExports.has(currentFileExportName)
                      ) {
                        continue;
                      }
                      // Found in subdirectory barrel - import from that directory
                      // (even if parent barrel is circular, subdirectory is fine)
                      const subdirPath = path.join(currentDir, item.name);
                      return normalizeBarrelPath(
                        path.relative(startDir, subdirPath),
                      );
                    }
                  }
                }
              }
            } catch {
              // Can't read, skip
            }

            // Export is in the barrel but not in a file or subdirectory we can find
            // If barrel is circular, we can't use it - move up
            if (isCircular) {
              const parentDir = path.dirname(currentDir);
              if (parentDir === currentDir) break;
              currentDir = parentDir;
              continue;
            }

            // Not circular, so we can import from the barrel directory
            const relativePath = normalizeBarrelPath(
              path.relative(startDir, currentDir),
            );
            // If normalizeBarrelPath returns empty, it means we're at the same directory
            // This shouldn't happen - we should have found the file or subdirectory
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

        // Move up one level
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break;
        currentDir = parentDir;
      }

      return null;
    }

    function calculateRelativePath(
      fileDir: string,
      fileBoundary: Boundary,
      node: Rule.Node,
      currentFilePath?: string,
    ): string {
      const importedNames = getImportedNames(node);

      // For same-boundary imports, find nearest path for each export
      // If all in same path, use that; otherwise use boundary root as fallback
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

        // If all exports are from the same path, use that
        if (exportPaths.size === 1) {
          const [importPath] = exportPaths;
          if (importPath) {
            return importPath;
          }
        }
      }

      // Fallback: can't find exports or they're split, use boundary root
      return normalizeBarrelPath(path.relative(fileDir, fileBoundary.absDir));
    }

    function createFixer(
      node: Rule.Node,
      newPath: string,
    ): Rule.ReportFixer | null {
      return (fixer) => {
        if ('source' in node && node.source) {
          return fixer.replaceText(node.source as Rule.Node, `'${newPath}'`);
        }
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
        return null;
      };
    }

    function handleImport(node: Rule.Node, rawSpec: string): void {
      const fileData = getFileData();
      if (!fileData.isValid) return;

      // Check 0: Alias subpaths
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

      // Case 1: File is inside a boundary
      if (fileBoundary) {
        // Check 1: Forbid using boundary's own alias inside
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

        // Check 2: Relative imports must stay within boundary
        if (isRelativeImport(rawSpec)) {
          const targetAbs = path.resolve(fileDir, rawSpec);
          const targetIsInsideBoundary = isInsideDir(
            fileBoundary.absDir,
            targetAbs,
          );

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

          // Check 3: For same-boundary relative imports
          // Rule: "Always forward once" - can go backwards as needed, but only forward once
          // - Same directory: import directly from file (./filename), not barrel (./)
          // - Sibling directory: use barrel (../sibling/)
          // - Parent/ancestor: use barrel (../, ../../) if no circular dependency
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

      // Case 2: File is outside all boundaries
      // Only check this if the file is not inside any boundary
      if (!fileBoundary && isRelativeImport(rawSpec)) {
        const targetAbs = path.resolve(fileDir, rawSpec);
        const targetBoundary = resolvedBoundaries.find((b) =>
          isInsideDir(b.absDir, targetAbs),
        );

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

    return {
      Program(programNode) {
        cachedFileData = null;
        barrelExportsCache.clear();
        importDeclarations.length = 0; // Clear for new file

        // Collect all import declarations
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
      ImportDeclaration(node) {
        const spec = (node.source as { value?: string })?.value;
        if (typeof spec === 'string') {
          handleImport(node, spec);
        }
      },
      ImportExpression(node) {
        const arg = node.source;
        if (arg?.type === 'Literal' && typeof arg.value === 'string') {
          handleImport(node, arg.value);
        }
      },
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
