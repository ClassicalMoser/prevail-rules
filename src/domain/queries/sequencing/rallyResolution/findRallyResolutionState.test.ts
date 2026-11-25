import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRallyResolutionState } from './findRallyResolutionState';

/**
 * Each player has one rally a cleanup; the player with initiative rallies
 * first (§10.3), and the slots are named for that order.
 */
describe('findRallyResolutionState function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('reads each player’s own rally, by the order they rally in', () => {
    // Black chose to rally, and white, second, chose not to.
    const blackRally = createRallyResolutionState({ playerRallied: true });
    const whiteRally = createRallyResolutionState({ playerRallied: false });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: blackRally,
        secondPlayerRallyResolutionState: whiteRally,
        step: 'secondPlayerResolveRally',
      }),
    );

    // Black's is the first rally, and white's the second.
    expect(findRallyResolutionState(state, 'black')).toBe(blackRally);
    expect(findRallyResolutionState(state, 'white')).toBe(whiteRally);
  });

  it('answers that a rally has not begun before its player has chosen', () => {
    // Black has not yet chosen whether to rally.
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    // No rally to read, and that is an ordinary answer.
    expect(findRallyResolutionState(state, 'black')).toBeUndefined();
  });
});
