import type { GameOverEvent } from '@events';
import { createEmptyGameState } from '@factories';
import { getCurrentPhaseState } from '@queries';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyGameOverEvent } from './applyGameOverEvent';

/**
 * The battle ends the instant a hand gives out (§11); the procedure found the
 * side that prevailed, and the apply records it.
 */
describe('applyGameOverEvent function', () => {
  it('records the side that prevailed, and moves nothing else', () => {
    // A round under way. Which ending it was is the procedure's to find;
    // the event names only the side that prevailed.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event: GameOverEvent = {
      effectType: 'gameOver',
      eventType: 'gameEffect',
      winner: 'white',
    };

    const next = applyGameOverEvent(event, state);

    // White has prevailed.
    expect(next.winner).toBe('white');

    // The game stops where it ended: no phase is moved on.
    expect(getCurrentPhaseState(next)).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
  });
});
