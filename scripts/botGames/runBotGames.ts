import type { GameModeName } from '@ruleValues';
import type { BotGamesSummary } from '@bot';
import { summarizeBotGames } from '@bot';
import { availableParallelism } from 'node:os';
import type { CommandResult } from '../commandResult';
import { playInWorkers } from './playInWorkers';

/** How many games to play when none is asked for. */
const DEFAULT_GAMES = 50;

/**
 * How long one game may take before it counts as hung. A standard game takes
 * about half a second and the slowest under one, so this is generous enough
 * that only a real hang reaches it.
 */
const GAME_TIMEOUT_MS = 30_000;

/**
 * Words a summary as a few lines: who won, how games ended, and how long they
 * took. Each fault is listed with its seed, so it can be replayed.
 */
function describeSummary(
  mode: GameModeName,
  summary: BotGamesSummary,
): string[] {
  const played = summary.games.length;
  const lines = [
    `${played} ${mode} games, default temperament on both sides`,
    `  white won ${summary.whiteWins}, black won ${summary.blackWins}, drawn ${summary.draws}, unfinished ${summary.unfinished}`,
    `  a finished game lasted ${summary.meanRounds.toFixed(1)} rounds on average`,
    `  one game took ${summary.medianMs.toFixed(0)} ms at the median, ${summary.slowestMs.toFixed(0)} ms at the slowest`,
  ];
  for (const game of summary.games) {
    if (game.ending !== 'finished') {
      lines.push(
        `  seed ${game.seed}: ${game.ending}${game.fault === undefined ? '' : ` — ${game.fault}`}`,
      );
    }
  }
  return lines;
}

/**
 * Plays bot games and reports how they went: `pnpm bot:games [count] [mode]`.
 * Both sides play the default temperament with the sample starter armies;
 * `mini` plays the small board with the mini armies, anything else the
 * standard board. Games are played side by side, one worker thread per core.
 * It fails if any game ended in a fault, since a fault is a choice the rules
 * offered and then refused, or hung past its time limit.
 *
 * @returns The report, failing on a fault or a hang
 */
export async function runBotGames(): Promise<CommandResult> {
  const count = Number(process.argv[3] ?? DEFAULT_GAMES);
  const mode: GameModeName = process.argv[4] === 'mini' ? 'mini' : 'standard';

  // One game per core at a time, each under its own time limit.
  const startedAt = performance.now();
  const run = await playInWorkers(
    mode,
    count,
    availableParallelism(),
    GAME_TIMEOUT_MS,
  );
  const wallSeconds = (performance.now() - startedAt) / 1000;

  const summary = summarizeBotGames(run.records);
  const faults = summary.games.filter((game) => game.ending === 'fault').length;
  const hung = run.hungSeeds.toSorted((a, b) => a - b);

  // What went wrong, by kind; nothing at all is a pass.
  const problems = [
    faults > 0 ? `${faults} bot games ended in a fault` : undefined,
    hung.length > 0 ? `${hung.length} bot games hung` : undefined,
  ].filter((problem) => problem !== undefined);

  const lines = [
    ...describeSummary(mode, summary),
    `  ${count} games in ${wallSeconds.toFixed(1)} s across ${availableParallelism()} workers`,
    ...hung.map(
      (seed) => `  seed ${seed}: hung past ${GAME_TIMEOUT_MS / 1000} s`,
    ),
  ];
  const result: CommandResult = {
    failure: problems.length > 0 ? problems.join('; ') : null,
    output: lines.join('\n'),
  };
  return result;
}
