import type { GameModeName } from '@entities';
import type { BotGamesSummary } from '@bot';
import { defaultBotTemperament, playBotGames } from '@bot';
import {
  blackMiniStarterArmy,
  blackStandardStarterArmy,
  whiteMiniStarterArmy,
  whiteStandardStarterArmy,
} from '@sampleValues';
import type { CommandResult } from '../commandResult';

/** How many games to play when none is asked for. */
const DEFAULT_GAMES = 50;

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
 * standard board. It fails if any game ended in a fault, since a fault is a
 * choice the rules offered and then refused.
 *
 * @returns The report, failing on a fault
 */
export async function runBotGames(): Promise<CommandResult> {
  const count = Number(process.argv[3] ?? DEFAULT_GAMES);
  const mode: GameModeName = process.argv[4] === 'mini' ? 'mini' : 'standard';
  const mini = mode === 'mini';
  const summary = playBotGames(
    {
      blackArmy: mini ? blackMiniStarterArmy : blackStandardStarterArmy,
      blackTemperament: defaultBotTemperament,
      gameMode: mode,
      whiteArmy: mini ? whiteMiniStarterArmy : whiteStandardStarterArmy,
      whiteTemperament: defaultBotTemperament,
    },
    1,
    count,
  );
  const faults = summary.games.filter((game) => game.ending === 'fault').length;
  const result: CommandResult = {
    failure: faults > 0 ? `${faults} bot games ended in a fault` : null,
    output: describeSummary(mode, summary).join('\n'),
  };
  return result;
}
