import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { boundaries } from '../../boundaries';
import type { ImportEdge } from './importEdge';
import { readImportEdges } from './readImportEdges';
import type { SourceTree } from './sourceTree';

/** One module's path with its text, so the reads can run together. */
interface SourceFile {
  /** The module's absolute path. */
  file: string;
  /** Its text. */
  text: string;
}

/**
 * Reads one module.
 *
 * @param file - The module's absolute path
 * @returns Its path with its text
 */
async function readSourceFile(file: string): Promise<SourceFile> {
  const text = await readFile(file, 'utf8');
  const sourceFile: SourceFile = { file, text };
  return sourceFile;
}

/**
 * Reads the whole source tree into memory.
 *
 * Everything downstream works from this, so no later step touches the disk and
 * the walk over the graph stays a plain traversal.
 *
 * @param srcDir - The `src` directory to read
 * @returns The files, their text, their edges, and the alias map
 */
export async function readSourceTree(srcDir: string): Promise<SourceTree> {
  // The aliases come off boundaries.ts, so there is no second list to keep in
  // step when a layer is added.
  const aliasDirs = new Map<string, string>();
  for (const boundary of boundaries) {
    // `alias` is what an import says. `identifier` is required and matches it
    // for every boundary here, so it stands in when alias is unset.
    const importName = boundary.alias ?? boundary.identifier;
    const directory = path.join(srcDir, boundary.dir);
    aliasDirs.set(importName, directory);
  }

  // Every module, by absolute path.
  const relativePaths = await Array.fromAsync(glob('**/*.ts', { cwd: srcDir }));
  const files = new Set<string>();
  for (const relative of relativePaths) {
    const absolute = path.join(srcDir, relative);
    files.add(absolute);
  }

  // Read them together, then index the text by path.
  const reads = [...files].map((file) => readSourceFile(file));
  const sourceFiles = await Promise.all(reads);
  const sources = new Map<string, string>();
  for (const sourceFile of sourceFiles) {
    sources.set(sourceFile.file, sourceFile.text);
  }

  // Parse each module's edges once, since the walk revisits modules often.
  const edges = new Map<string, ImportEdge[]>();
  for (const sourceFile of sourceFiles) {
    const moduleEdges = readImportEdges(sourceFile.text);
    edges.set(sourceFile.file, moduleEdges);
  }

  const tree: SourceTree = { aliasDirs, edges, files, sources };
  return tree;
}
