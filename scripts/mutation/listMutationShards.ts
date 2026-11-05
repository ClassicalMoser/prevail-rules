import { readFile } from 'node:fs/promises';
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
 * The shards for the nightly mutation run, one per boundary in `boundaries.ts`.
 *
 * `--mutate` replaces the config's list rather than narrowing it, so each shard
 * carries the config's exclusions with it. A boundary the config excludes whole
 * (`@testing`, `@sampleValues`) gets no shard. Reading both files means a new
 * boundary is mutated without anyone editing the workflow.
 *
 * @returns The shards, in `boundaries.ts` order
 */
export async function listMutationShards(): Promise<MutationShard[]> {
  // The config's negated patterns are the exclusions every shard must repeat.
  const configText = await readFile('stryker.config.json', 'utf8');
  const config = strykerConfigSchema.parse(JSON.parse(configText));
  const exclusions = config.mutate.filter((pattern) => pattern.startsWith('!'));

  // A boundary is skipped when the config already excludes its whole directory.
  const mutated = boundaries.filter(
    (boundary) => !exclusions.includes(`!src/${boundary.dir}/**/*.{js,ts}`),
  );

  // Each shard mutates its own directory, minus the shared exclusions. The CLI
  // splits `--mutate` on commas, so a `{js,ts}` group has to become two globs.
  const shards = mutated.map((boundary) => {
    const include = `src/${boundary.dir}/**/*.{js,ts}`;
    const patterns = [include, ...exclusions].flatMap((pattern) =>
      expandBraces(pattern),
    );
    const shard: MutationShard = {
      boundary: boundary.identifier.replace(/^@/u, ''),
      mutate: patterns.join(','),
    };
    return shard;
  });
  return shards;
}

// Printed as one JSON line so the workflow can pass it to `fromJSON`.
const shardsJson = JSON.stringify(await listMutationShards());
console.log(shardsJson);
