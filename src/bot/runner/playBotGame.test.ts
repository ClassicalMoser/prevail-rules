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

  it('records the round of every rally each side made, in order', () => {
    const record = playBotGame(setup);
    const { black, white } = record.rallyRounds;
    // One round recorded for each rally the game resolved (§10).
    expect(black.length + white.length).toBe(
      record.eventCounts.resolveRally ?? 0,
    );
    for (const rounds of [black, white]) {
      // Each side's rallies come in the order they were made, within the game.
      expect(rounds).toStrictEqual(rounds.toSorted((a, b) => a - b));
      expect(rounds.every((round) => round <= record.rounds)).toBe(true);
    }
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
