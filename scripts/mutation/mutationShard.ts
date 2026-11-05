/**
 * One Stryker run: a boundary's directory, with the config's own exclusions.
 */
export interface MutationShard {
  /** The boundary's identifier without the `@`, used to name the job and its report. */
  boundary: string;
  /** The `--mutate` list for this shard, comma-separated. */
  mutate: string;
}
