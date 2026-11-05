/** Matches a brace clause, whose contents are the named bindings. */
const BRACES = /\{(?<names>[\s\S]*)\}/u;

/** Matches a clause that imports types only, which call nothing. */
const TYPE_ONLY = /^\s*type\b/u;

/** Matches a default or namespace binding in a clause with no braces. */
const BARE_BINDING = /^\s*(?:\*\s+as\s+)?(?<binding>\w+)/u;

/** Matches the rename in `original as local`, whose left side is the export. */
const RENAME = /\s+as\s+/u;

/**
 * Reads the bindings out of one import clause: the text between the keyword
 * and the specifier.
 *
 * @param clause - The clause text, which may span lines
 * @returns The names taken, or null when the clause is type-only
 */
export function parseImportClause(clause: string): string[] | null {
  // A type is never called, so a type-only clause carries nothing.
  if (TYPE_ONLY.test(clause)) {
    return null;
  }

  // A brace clause lists its bindings, minus any marked `type` inline.
  const braced = BRACES.exec(clause)?.groups?.names;
  if (braced !== undefined) {
    const parts = braced.split(',');
    const names: string[] = [];
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length === 0 || trimmed.startsWith('type ')) {
        continue;
      }
      // A rename exports under its left-hand name.
      const original = trimmed.split(RENAME)[0] ?? trimmed;
      names.push(original.trim());
    }
    return names;
  }

  // Otherwise it is a default binding, or a namespace that takes everything.
  const bare = BARE_BINDING.exec(clause)?.groups?.binding;
  const names = bare === undefined ? ['*'] : [bare];
  return names;
}
