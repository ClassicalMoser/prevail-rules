import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import type { ScopeFloor } from './scopeFloor';

/** The recorded floors, keyed by boundary alias without its `@`. */
const baselineSchema = z.record(
  z.string(),
  z.object({ source: z.number(), specs: z.number() }),
);

/** The floors live beside this check, not in the package manifest. */
const BASELINE = path.resolve(import.meta.dirname, 'baseline.json');

/**
 * Reads the recorded floor for each scope.
 *
 * A scope missing from the file has no floor and cannot fail, which is what
 * makes adding a boundary safe: it is measured and reported from the first
 * run, and pinned only when someone records it.
 *
 * @returns The floors by scope name, empty when the file is absent
 */
export async function readCommentaryBaseline(): Promise<
  Map<string, ScopeFloor>
> {
  // Resolved against this file rather than the working directory, so the check
  // finds its floors whether it is run from the repository root or elsewhere.
  const text = await readFile(BASELINE, 'utf8');

  // Parsed rather than trusted: a floor that arrived as a string would compare
  // against a number by coercion and quietly never fail.
  const parsed = baselineSchema.parse(JSON.parse(text));

  // A Map because every lookup below is by scope name, and a missing key has
  // to be distinguishable from a floor of zero.
  const floors = new Map<string, ScopeFloor>(Object.entries(parsed));
  return floors;
}
