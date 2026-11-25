import { createInitialGameState } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { updateWinner } from '@transforms';
import { getExpectedEvent } from './getExpectedEvent';

/**
 * The twin of findExpectedEvent for a caller that knows the battle goes on.
 * While it does, both answer the same; once it is won, this one throws. What
 * comes next in each phase is findExpectedEvent's spec.
 */
describe('getExpectedEvent function', () => {
  it('answers what the game waits for while the battle goes on', () => {
    // A new mini game: both armies wait in reserve, and White holds the
    // initiative (§3.5.4).
    const state = createInitialGameState({
      blackArmy: blackMiniStarterArmy,
      gameMode: 'mini',
      whiteArmy: whiteMiniStarterArmy,
    });

    // White places its whole army first.
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('throws once the battle has a winner', () => {
    // Black has prevailed, so nothing is owed; this twin insists on an answer.
    const game = createInitialGameState({
      blackArmy: blackMiniStarterArmy,
      gameMode: 'mini',
      whiteArmy: whiteMiniStarterArmy,
    });
    const state = updateWinner(game, 'black');

    expect(() => getExpectedEvent(state)).toThrow('Game is already over');
  });
});
