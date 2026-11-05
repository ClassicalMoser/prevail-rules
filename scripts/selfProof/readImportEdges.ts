import type { ImportEdge } from './importEdge';
import { parseImportClause } from './parseImportClause';

/**
 * Matches one import or re-export, capturing the text between the keyword and
 * the specifier as a clause. A clause cannot hold a quote, so it stops at the
 * specifier and never runs on into the next statement.
 */
const STATEMENT =
  /(?:^|\n)[\t ]*(?:import|export)\b(?<clause>[^'"]*)'(?<spec>[^']+)'/gu;

/**
 * Reads the value edges out of one module's source.
 *
 * @param source - The module's text
 * @returns Its imports and re-exports, type-only edges dropped
 */
export function readImportEdges(source: string): ImportEdge[] {
  const edges: ImportEdge[] = [];
  for (const match of source.matchAll(STATEMENT)) {
    const spec = match.groups?.spec;
    const clause = match.groups?.clause ?? '';
    const names = parseImportClause(clause);
    // A specifier this pattern could not read, or a type-only clause, is
    // nothing to follow.
    if (spec === undefined || names === null) {
      continue;
    }
    const edge: ImportEdge = { names, spec };
    edges.push(edge);
  }
  return edges;
}
