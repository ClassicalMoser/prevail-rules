import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@game';
import { createEmptyGameState } from '@factories';
import { updatePhaseState } from '@transforms';

import { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';

/**
 * Move Commanders complete: the round moves on to issuing orders. Each
 * player's orders are the command on their card in play, which the state
 * holds, so the effect records nothing more.
 */
describe('generateCompleteMoveCommandersPhaseEvent function', () => {
  it('ends Move Commanders with an effect that carries nothing', () => {
    // Both commanders have moved; the phase is complete.
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    // The effect names only itself.
    expect(generateCompleteMoveCommandersPhaseEvent(state)).toStrictEqual({
      effectType: 'completeMoveCommandersPhase',
      eventType: 'gameEffect',
    });
  });

  it('throws outside Move Commanders, since only that phase ends here', () => {
    // The round is still playing cards.
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    // Asked to end a phase the round is not in, it refuses.
    expect(() => generateCompleteMoveCommandersPhaseEvent(state)).toThrow(
      'moveCommanders',
    );
  });
});
