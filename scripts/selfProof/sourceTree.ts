import type { ImportEdge } from './importEdge';

/** The source tree, read once, with every module's value edges parsed. */
export interface SourceTree {
  /** Import alias to the directory it stands for. */
  aliasDirs: Map<string, string>;
  /** Each module's value edges. */
  edges: Map<string, ImportEdge[]>;
  /** Every `.ts` file under the source directory, specs included. */
  files: Set<string>;
  /** Each module's text. */
  sources: Map<string, string>;
}
