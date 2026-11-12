import { runBotGames } from './botGames/runBotGames';
import { checkCommentaryDensity } from './commentary/checkCommentaryDensity';
import { checkSelfProvingSpecs } from './selfProof/checkSelfProvingSpecs';
import type { CommandResult } from './commandResult';
import { listMutationShards } from './mutation/listMutationShards';
import { summarizeMutationReports } from './mutation/summarizeMutationReports';

/**
 * The one way to run this repository's scripts: `tsx scripts/main.ts <command>`.
 *
 * Each command is a function in its own directory that returns what to print
 * and whether it failed. This file holds the only print site and the only exit
 * path, so no script does either at import time. That keeps every script
 * importable, and keeps a stray console write out of a module that something
 * else may one day call.
 */

/** Every command, by the name used on the command line. */
const commands = new Map<string, () => Promise<CommandResult>>([
  ['botGames', runBotGames],
  ['commentary', checkCommentaryDensity],
  ['mutationShards', listMutationShards],
  ['mutationSummary', summarizeMutationReports],
  ['selfProof', checkSelfProvingSpecs],
]);

const name = process.argv[2];
const command = name === undefined ? undefined : commands.get(name);

if (command === undefined) {
  // Naming the commands beats a usage string that drifts from the map above.
  const known = [...commands.keys()].join(', ');
  throw new Error(`Unknown script command '${name ?? ''}'. Known: ${known}`);
}

const result = await command();

// eslint-disable-next-line no-console
console.log(result.output);

// Throwing is what gives the non-zero exit; the output above says what to fix.
if (result.failure !== null) {
  throw new Error(result.failure);
}
