import { createEmptyGameState } from '@factories';
import { MOVE_COMMANDERS_PHASE } from '@game';
import type { MoveCommandersPhaseStep } from '@game';
import { getMoveCommandersPhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applySkipLostCommanderMoveEvent } from './applySkipLostCommanderMoveEvent';
import { withLostCommander } from '@testing';

/**
 * A fallen commander's turn passes on as a move would (§4.2.1, §4.2.8), with
 * the board left as it was.
 */
describe('applySkipLostCommanderMoveEvent function', () => {
  const event = {
    effectType: 'skipLostCommanderMove' as const,
    eventType: 'gameEffect' as const,
  };

  /** The given Move Commanders step, with White's commander fallen. */
  function onStep(step: MoveCommandersPhaseStep) {
    const lost = withLostCommander(createEmptyGameState('standard'), 'white');
    const state = updatePhaseState(lost, {
      phase: MOVE_COMMANDERS_PHASE,
      step,
    });
    return state;
  }

  it("passes the first player's turn to the second player", () => {
    const state = onStep('moveFirstCommander');

    const passed = applySkipLostCommanderMoveEvent(event, state);

    // The second player's turn comes next; nothing on the board moved.
    expect(getMoveCommandersPhaseState(passed).step).toBe(
      'moveSecondCommander',
    );
    expect(passed.boardState).toBe(state.boardState);
  });

  it("ends the phase after the second player's turn", () => {
    const state = onStep('moveSecondCommander');

    const passed = applySkipLostCommanderMoveEvent(event, state);

    // With both turns taken, the phase is done.
    expect(getMoveCommandersPhaseState(passed).step).toBe('complete');
  });
});
