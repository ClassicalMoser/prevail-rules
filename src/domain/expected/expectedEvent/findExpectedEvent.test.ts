import { createEmptyGameState } from '@factories';
import { PLAY_CARDS_PHASE } from '@game';
import { createPlayableGame } from '@testing';
import { updatePhaseState } from '@transforms';
import { findExpectedEvent } from './findExpectedEvent';

describe('findExpectedEvent function', () => {
  it('returns nothing once a winner is set, because a finished game expects no event', () => {
    // The battle is over: nobody is owed a choice and no effect is due.
    const state = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };

    expect(findExpectedEvent(state)).toBeUndefined();
  });

  it('returns the next expected event while the game is still being played', () => {
    // A battle under way: each side has an army on the board and cards in hand.
    const game = createPlayableGame([
      { coord: 'E-5', facing: 'north', player: 'black' },
      { coord: 'E-6', facing: 'south', player: 'white' },
    ]);
    // The round has reached the choosing of cards.
    const state = updatePhaseState(game, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    // Both players are owed the secret choice of a card (§4.1.1).
    expect(findExpectedEvent(state)).toMatchObject({
      actionType: 'playerChoice',
      choiceType: 'chooseCard',
    });
  });
});
