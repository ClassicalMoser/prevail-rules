/**
 * One import or re-export, holding the names taken as values.
 *
 * Type-only imports never become an edge. A type is not called, so it cannot
 * carry behaviour from one module to another.
 */
export interface ImportEdge {
  /** The bindings taken, or `['*']` for a namespace or whole-module import. */
  names: string[];
  /** The specifier as written, alias or relative. */
  spec: string;
}
