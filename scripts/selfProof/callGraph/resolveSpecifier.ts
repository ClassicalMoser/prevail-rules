import path from 'node:path';
import type { SourceTree } from '../sourceTree/sourceTree';

/**
 * Turns one import specifier into the file it loads.
 *
 * @param tree - The source tree, for its aliases and its file list
 * @param fromFile - The importing module, which relative specifiers are read against
 * @param spec - The specifier as written
 * @returns The file it loads, or null for an external package
 */
export function resolveSpecifier(
  tree: SourceTree,
  fromFile: string,
  spec: string,
): string | null {
  let base: string;
  if (spec.startsWith('@')) {
    // An alias names a layer, and anything after it is a path inside it.
    const [aliasName, ...rest] = spec.split('/');
    const directory = tree.aliasDirs.get(aliasName ?? '');
    if (directory === undefined) {
      return null;
    }
    base = rest.length > 0 ? path.join(directory, rest.join('/')) : directory;
  } else if (spec.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else {
    // An external package cannot reach back into this source tree.
    return null;
  }

  // A specifier may name the file, the file without its extension, or a
  // directory whose barrel stands for it.
  const candidates = [base, `${base}.ts`, path.join(base, 'index.ts')];
  for (const candidate of candidates) {
    if (tree.files.has(candidate)) {
      return candidate;
    }
  }
  return null;
}
