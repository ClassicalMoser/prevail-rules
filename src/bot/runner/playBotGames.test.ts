import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { defaultBotTemperament } from '@bot/temperament';
import { playBotGames } from './playBotGames';

/**
 * A run of bot games and its summary.
 */
describe('playBotGames function', () => {
  it('plays one game per seed, and every game is counted once in the summary', () => {
    const summary = playBotGames(
      {
        blackArmy: blackMiniStarterArmy,
        blackTemperament: defaultBotTemperament,
        gameMode: 'mini',
        whiteArmy: whiteMiniStarterArmy,
        whiteTemperament: defaultBotTemperament,
      },
      5,
      2,
    );
    expect(summary.games.map((game) => game.seed)).toStrictEqual([5, 6]);
    expect(
      summary.whiteWins +
        summary.blackWins +
        summary.draws +
        summary.unfinished,
    ).toBe(2);
  });
});
