import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { boundaries } from '../../boundaries';

/** The one field of `stryker.config.json` the shards are built from. */
const strykerConfigSchema = z.object({ mutate: z.array(z.string()) });

/**
 * One Stryker run: a boundary's directory, with the config's own exclusions.
 */
interface MutationShard {
  /** The boundary's identifier without the `@`, used to name the job and its report. */
  boundary: string;
  /** The `--mutate` list for this shard, comma-separated. */
  mutate: string;
}

/**
 * A glob with each `{a,b}` group written out as separate globs, so the list can
 * be comma-joined. Groups do not nest in this config; each one is expanded in
 * turn, left to right.
 *
 * @param pattern - A glob, possibly negated, possibly with brace groups
 * @returns The equivalent globs without brace groups
 */
function expandBraces(pattern: string): string[] {
  // A pattern with no group is already one glob.
  const group = /\{(?<alternatives>[^{}]*)\}/u.exec(pattern);
  if (group === null) {
    return [pattern];
  }

  // Each alternative replaces the group, and the rest of the pattern is expanded again.
  const [whole] = group;
  const alternatives = group.groups?.alternatives ?? '';
  const expanded = alternatives
    .split(',')
    .flatMap((alternative) =>
      expandBraces(pattern.replace(whole, alternative)),
    );
  return expanded;
}

/**
 * Whether the config's `mutate` list selects a file, the way Stryker reads it:
 * some pattern includes it and no `!` pattern excludes it.
 *
 * @param file - A path relative to the repository root
 * @param mutate - The config's `mutate` list
 * @returns Whether Stryker would mutate the file
 */
function isMutated(file: string, mutate: string[]): boolean {
  // Positive patterns select, negated ones remove, regardless of order.
  const included = mutate
    .filter((pattern) => !pattern.startsWith('!'))
    .some((pattern) => path.matchesGlob(file, pattern));
  const excluded = mutate
    .filter((pattern) => pattern.startsWith('!'))
    .some((pattern) => path.matchesGlob(file, pattern.slice(1)));
  const mutated = included && !excluded;
  return mutated;
}

/**
 * The shards for the nightly mutation run, one per boundary in `boundaries.ts`.
 *
 * `--mutate` replaces the config's list rather than narrowing it, so each shard
 * carries the config's exclusions with it. A boundary gets a shard only when
 * the config would mutate at least one of its files; that is decided by
 * matching its files against the config, so it holds however an exclusion is
 * written. Reading both files means a new boundary is mutated without anyone
 * editing the workflow.
 *
 * @returns The shards, in `boundaries.ts` order
 */
export async function listMutationShards(): Promise<MutationShard[]> {
  // The config's patterns decide which files are mutated at all.
  const configText = await readFile('stryker.config.json', 'utf8');
  const config = strykerConfigSchema.parse(JSON.parse(configText));
  const exclusions = config.mutate.filter((pattern) => pattern.startsWith('!'));

  // A boundary is mutated when the config selects any file in its directory.
  const shards: MutationShard[] = [];
  for (const boundary of boundaries) {
    const files = await Array.fromAsync(glob(`src/${boundary.dir}/**/*`));
    const mutated = files.some((file) => isMutated(file, config.mutate));
    if (!mutated) {
      continue;
    }

    // The shard mutates its own directory, minus the shared exclusions. The CLI
    // splits `--mutate` on commas, so a `{js,ts}` group has to become two globs.
    const include = `src/${boundary.dir}/**/*.{js,ts}`;
    const patterns = [include, ...exclusions].flatMap((pattern) =>
      expandBraces(pattern),
    );
    shards.push({
      boundary: boundary.identifier.replace(/^@/u, ''),
      mutate: patterns.join(','),
    });
  }
  return shards;
}

// Printed as one JSON line so the workflow can pass it to `fromJSON`.
const shardsJson = JSON.stringify(await listMutationShards());
// eslint-disable-next-line no-console
console.log(shardsJson);
