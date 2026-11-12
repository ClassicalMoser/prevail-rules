import type { BotGameRecord, BotGameSetup } from './playBotGame';
import { playBotGame } from './playBotGame';

/** What a set of bot games came to. */
export interface BotGamesSummary {
  /** Every game, in seed order. */
  games: readonly BotGameRecord[];
  /** Games each side won. */
  whiteWins: number;
  blackWins: number;
  /** Games that finished without a winner (§11.3). */
  draws: number;
  /** Games that hit a fault or ran past the event limit. */
  unfinished: number;
  /** The average round a finished game ended in. */
  meanRounds: number;
  /** The median and slowest time to play one game, in milliseconds. */
  medianMs: number;
  slowestMs: number;
}

/**
 * Plays the same setup from a run of seeds and sums up how it went: who won,
 * how long games ran, and which games went wrong. Every game is independent
 * and replays from its seed.
 *
 * @param setup - The battle and the bots, without a seed
 * @param firstSeed - The first seed to play
 * @param count - How many games to play
 * @returns The games and their summary
 */
export function playBotGames(
  setup: Omit<BotGameSetup, 'seed'>,
  firstSeed: number,
  count: number,
): BotGamesSummary {
  const games: BotGameRecord[] = [];
  for (let seed = firstSeed; seed < firstSeed + count; seed += 1) {
    games.push(playBotGame({ ...setup, seed }));
  }
  const finished = games.filter((game) => game.ending === 'finished');
  const times = games.map((game) => game.durationMs).toSorted((a, b) => a - b);
  const summary: BotGamesSummary = {
    blackWins: finished.filter((game) => game.winner === 'black').length,
    draws: finished.filter((game) => game.winner === undefined).length,
    games,
    meanRounds:
      finished.length === 0
        ? 0
        : finished.reduce((total, game) => total + game.rounds, 0) /
          finished.length,
    medianMs: times[Math.floor(times.length / 2)] ?? 0,
    slowestMs: times.at(-1) ?? 0,
    unfinished: games.length - finished.length,
    whiteWins: finished.filter((game) => game.winner === 'white').length,
  };
  return summary;
}
