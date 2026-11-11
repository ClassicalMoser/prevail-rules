import { createChooseCardEvent, createEmptyGameState } from '@factories';
import { createTestCard } from '@testing';

import { validateExpectedChoice } from './validateExpectedChoice';

describe('validateExpectedChoice function', () => {
  it('refuses a choice sent after the battle is over, saying so', () => {
    // The battle is over: black has won, so nobody is owed a choice any more.
    const finished = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };
    const late = createChooseCardEvent({
      card: createTestCard(),
      player: 'white',
    });

    // A late choice is not a fault in the game: it is refused, and the
    // reason says the game has ended.
    expect(validateExpectedChoice(late, finished)).toStrictEqual({
      errorReason: 'The game is over, so no choice is expected',
      result: false,
    });
  });
});
