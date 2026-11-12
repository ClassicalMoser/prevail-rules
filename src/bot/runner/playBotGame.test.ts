import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { defaultBotTemperament } from '@bot/temperament';
import { playBotGame } from './playBotGame';

/**
 * Two bots play a whole game through the engines, and the same seed plays
 * the same game.
 */
describe('playBotGame function', () => {
  const setup = {
    blackArmy: blackMiniStarterArmy,
    blackTemperament: defaultBotTemperament,
    gameMode: 'mini' as const,
    seed: 1,
    whiteArmy: whiteMiniStarterArmy,
    whiteTemperament: defaultBotTemperament,
  };

  it('plays a mini game to its end without a refused choice', () => {
    const record = playBotGame(setup);
    expect(record.fault).toBeUndefined();
    expect(record.ending).toBe('finished');
    // A finished game names its winner and why it ended (§11).
    expect(record.winner).toBeDefined();
    expect(record.endedBy).toBeDefined();
  });

  it('plays the same game again from the same seed', () => {
    const {
      durationMs: _first,
      decisionMs: _firstTimes,
      ...first
    } = playBotGame(setup);
    const {
      durationMs: _second,
      decisionMs: _secondTimes,
      ...second
    } = playBotGame(setup);
    expect(second).toStrictEqual(first);
  });
});
