import type { MoveCommandersPhaseStep } from '@game';
import { createEmptyGameState } from '@factories';
import { createMoveCommandersPhaseState, withLostCommander } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { generateSkipLostCommanderMoveEvent } from './generateSkipLostCommanderMoveEvent';

/**
 * A fallen commander's Move Commanders turn is passed over (§4.2.8). Black
 * holds the initiative, so Black moves first and White second.
 */
describe('generateSkipLostCommanderMoveEvent function', () => {
  /** The given Move Commanders step, with Black holding the initiative. */
  function onStep(step: MoveCommandersPhaseStep) {
    // Black took the initiative in Phase 1.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );

    // Move Commanders, on the step the case names.
    const state = updatePhaseState(
      base,
      createMoveCommandersPhaseState({ step }),
    );
    return state;
  }

  it("passes over the first player's turn when their commander has fallen", () => {
    // Black's turn, and Black's commander is lost.
    const state = withLostCommander(onStep('moveFirstCommander'), 'black');

    // The effect carries nothing; the state says whose turn passes.
    expect(generateSkipLostCommanderMoveEvent(state)).toStrictEqual({
      effectType: 'skipLostCommanderMove',
      eventType: 'gameEffect',
    });
  });

  it("passes over the second player's turn when their commander has fallen", () => {
    // White's turn, and White's commander is lost.
    const state = withLostCommander(onStep('moveSecondCommander'), 'white');

    // The second player's turn passes the same way.
    expect(generateSkipLostCommanderMoveEvent(state)).toStrictEqual({
      effectType: 'skipLostCommanderMove',
      eventType: 'gameEffect',
    });
  });

  it('throws when the player whose turn it is still has their commander, where nothing asks', () => {
    // Black's turn; it is White's commander that fell.
    const state = withLostCommander(onStep('moveFirstCommander'), 'white');

    // Black moves its own commander, so its turn is not passed over.
    expect(() => generateSkipLostCommanderMoveEvent(state)).toThrow(
      new Error("black's commander stands, so their move is not passed over"),
    );
  });

  it('throws once the phase is complete, where no turn is left', () => {
    // Both turns are taken, so no turn is left to pass.
    expect(() =>
      generateSkipLostCommanderMoveEvent(onStep('complete')),
    ).toThrow(new Error('Move Commanders is complete; no turn to pass over'));
  });
});
