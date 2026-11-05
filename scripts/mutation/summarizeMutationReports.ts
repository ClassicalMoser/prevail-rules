import type { CommandResult } from '../commandResult';
import { mergeMutationReports } from './mergeMutationReports';

/** Where the workflow downloads each shard's report. */
const SHARDS_DIR = 'shards';

/** Where the workflow uploads the merged report from. */
const OUT_DIR = 'reports/mutation';

/**
 * Merges the per-boundary mutation reports and prints the score table.
 *
 * The directories are the workflow's own, so the command takes no arguments
 * and the two names live here rather than in the job definition.
 *
 * @returns The score table, which cannot fail without throwing first
 */
export async function summarizeMutationReports(): Promise<CommandResult> {
  const output = await mergeMutationReports(SHARDS_DIR, OUT_DIR);
  const result: CommandResult = { failure: null, output };
  return result;
}
