import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRallyResolutionState } from './findRallyResolutionState';

/**
 * Each player has one rally a cleanup; the player with initiative rallies
 * first (§10.3), and the slots are named for that order.
 */
describe('findRallyResolutionState function', () => {
  it('reads each player’s own rally, by the order they rally in', () => {
    // White holds initiative, so white's rally is the first and black's the
    // second.
    const whiteRally = createRallyResolutionState({ playerRallied: true });
    const blackRally = createRallyResolutionState({ playerRallied: false });
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'white'),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: whiteRally,
        secondPlayerRallyResolutionState: blackRally,
        step: 'secondPlayerResolveRally',
      }),
    );

    expect(findRallyResolutionState(state, 'white')).toBe(whiteRally);
    expect(findRallyResolutionState(state, 'black')).toBe(blackRally);
  });

  it('answers that a rally has not begun before its player has chosen', () => {
    // Black holds initiative and has not yet chosen whether to rally.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    expect(findRallyResolutionState(state, 'black')).toBeUndefined();
  });
});
