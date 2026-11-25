import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import {
  createChooseMeleeResolutionEvent,
  createEmptyGameState,
} from '@factories';
import { getResolveMeleePhaseState } from '@queries';
import { createResolveMeleePhaseState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyChooseMeleeEvent } from './applyChooseMeleeEvent';

/**
 * Resolve-melee phase: player picks which contested hex to resolve next. That coordinate is
 * removed from `remainingEngagements` and becomes `currentMeleeResolutionState.location`.
 */
// TODO(misleading): the board is square spaces (§2.1.1), not hexes, and the
// choice is the first player's (§4.4.2). Settle by rewording "contested hex"
// to "engaged space".
describe('applyChooseMeleeEvent function', () => {
  /** ResolveMelee step with the given engagement queue and no current resolution yet. */
  function createStateInResolveMeleeStep(
    remainingSpaces: Coordinate[],
  ): GameState {
    // White holds the initiative, as a new game starts, so white chooses.
    const state = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: remainingSpaces,
    });
    const choosing = updatePhaseState(state, phase);
    return choosing;
  }

  it('fights the chosen engagement next, and leaves the others waiting', () => {
    // Two engaged spaces wait; the first player picks E-5 (§4.4.2).
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);

    const newState = applyChooseMeleeEvent(
      createChooseMeleeResolutionEvent({ player: 'white', space: 'E-5' }),
      state,
    );
    const phaseState = getResolveMeleePhaseState(newState);

    // E-6 still waits, and the melee at E-5 is under way.
    expect(phaseState.remainingEngagements).toStrictEqual(['E-6']);
    expect(
      throwIfPending(phaseState.currentMeleeResolutionState, 'melee').location,
    ).toBe('E-5');
  });

  it('refuses to open a second melee while one is being fought', () => {
    // Each engagement is resolved completely before the next is chosen
    // (§4.4.2), so a melee under way at E-5 leaves no room for E-6.
    const state = createEmptyGameState('standard');
    const fighting = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, { remainingEngagements: ['E-6'] }),
    );

    expect(() =>
      applyChooseMeleeEvent(
        createChooseMeleeResolutionEvent({ player: 'white', space: 'E-6' }),
        fighting,
      ),
    ).toThrow('A melee is already being resolved');
  });

  it('given white chooses E-6, input phase state remainingEngagements reference is untouched', () => {
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);
    const originalRemaining =
      getResolveMeleePhaseState(state).remainingEngagements;

    applyChooseMeleeEvent(
      createChooseMeleeResolutionEvent({ player: 'white', space: 'E-6' }),
      state,
    );

    // The original still waits on both spaces.
    expect(getResolveMeleePhaseState(state).remainingEngagements).toBe(
      originalRemaining,
    );
    expect(originalRemaining).toStrictEqual(['E-5', 'E-6']);
  });
});
