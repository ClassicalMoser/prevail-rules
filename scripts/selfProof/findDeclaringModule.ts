import type { SourceTree } from './sourceTree';
import { resolveSpecifier } from './resolveSpecifier';

/** Matches a value declaration of one name, which ends the search for it. */
function declarationOf(name: string): RegExp {
  const pattern = new RegExp(
    `export(?:[\\t ]+async)?[\\t ]+(?:function|const|let|class)[\\t ]+${name}\\b`,
    'u',
  );
  return pattern;
}

/**
 * Follows one name through the barrels to the module that declares it.
 *
 * Stopping at the barrel instead would make almost every module reach almost
 * every other one, because a layer's barrel re-exports the whole layer. The
 * declaring module is what a call actually runs.
 *
 * @param tree - The source tree to search
 * @param declaringModules - Names already placed, which this call adds to
 * @param file - The module the name was imported from
 * @param name - The binding to chase
 * @returns The declaring module, or null if the name cannot be placed
 */
export function findDeclaringModule(
  tree: SourceTree,
  declaringModules: Map<string, string | null>,
  file: string,
  name: string,
): string | null {
  const key = `${file}#${name}`;
  const cached = declaringModules.get(key);
  if (cached !== undefined) {
    return cached;
  }
  // Recorded before the search, so a re-export loop stops here rather than
  // running forever.
  declaringModules.set(key, null);

  const source = tree.sources.get(file) ?? '';
  const declaresIt = declarationOf(name).test(source);
  let site: string | null = null;
  if (name === '*' || declaresIt) {
    // Declared here, or a whole-module import that stops at this module.
    site = file;
  } else {
    // Otherwise this module re-exports it, so follow the edge that carries it.
    for (const edge of tree.edges.get(file) ?? []) {
      const carriesName = edge.names.includes(name) || edge.names.includes('*');
      if (!carriesName) {
        continue;
      }
      const next = resolveSpecifier(tree, file, edge.spec);
      if (next === null) {
        continue;
      }
      const declared = findDeclaringModule(tree, declaringModules, next, name);
      if (declared !== null) {
        site = declared;
        break;
      }
    }
  }

  declaringModules.set(key, site);
  return site;
}
