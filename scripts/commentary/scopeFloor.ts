/**
 * The density a scope has already reached, which it may not fall below.
 *
 * The standard is 25%, and nothing in the repository is there yet, so a check
 * that enforced it would fail every run and tell nobody anything. A floor per
 * scope turns the same measure into something that can run today: it says only
 * that a pass which rewrites a scope must not leave it less commented than it
 * found it.
 */
export interface ScopeFloor {
  /** The lowest acceptable source density, as a whole percent. */
  source: number;
  /** The lowest acceptable spec density, as a whole percent. */
  specs: number;
}
