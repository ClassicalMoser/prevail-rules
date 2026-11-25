import { createEmptyGameState } from '@factories';
import { createTestCard } from '@testing';
import { updateCurrentInitiative, updatePlayerCardState } from '@transforms';

import { generateGameOverEvent } from './generateGameOverEvent';

/**
 * The game ends the instant a loss condition holds (§11), and the event
 * records who prevailed, so a replay needs no second look at the hands.
 */
describe('generateGameOverEvent function', () => {
  it('names Black the winner when White has nothing left in hand', () => {
    // Black still holds a card; White's hand is empty, as a new game's is.
    const base = createEmptyGameState('standard');
    const state = updatePlayerCardState(base, 'black', {
      ...base.cardState.black,
      inHand: [createTestCard()],
    });

    // An empty hand loses at once (§11.1), and the winner is on the event.
    expect(generateGameOverEvent(state)).toStrictEqual({
      effectType: 'gameOver',
      eventType: 'gameEffect',
      winner: 'black',
    });
  });

  it('bakes the holder of initiative as winner when both hands are empty', () => {
    // Both hands emptying at once goes to the initiative held going into
    // the round (§11.3); the event bakes that winner in for replay.
    const emptyHands = createEmptyGameState('standard');
    // White held initiative going into this round.
    const state = updateCurrentInitiative(emptyHands, 'white');

    expect(generateGameOverEvent(state).winner).toBe('white');
  });

  it('throws when the game is not over', () => {
    // Both players hold a card, and neither army has been mustered, so no
    // loss condition holds.
    const base = createEmptyGameState('standard');
    const blackHolds = updatePlayerCardState(base, 'black', {
      ...base.cardState.black,
      inHand: [createTestCard()],
    });
    const state = updatePlayerCardState(blackHolds, 'white', {
      ...blackHolds.cardState.white,
      inHand: [createTestCard()],
    });

    // Asked for an ending that has not come, the procedure refuses.
    expect(() => generateGameOverEvent(state)).toThrow(
      'Game over is not expected for the current game state',
    );
  });
});
