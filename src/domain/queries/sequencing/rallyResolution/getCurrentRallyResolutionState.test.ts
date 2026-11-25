import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getCurrentRallyResolutionState } from './getCurrentRallyResolutionState';

/**
 * A rally is carried out on its player's resolve step. Any other cleanup step
 * has no rally being resolved.
 */
describe('getCurrentRallyResolutionState function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('returns the first player’s rally on the first resolve step', () => {
    // Black chose to rally and is carrying it out.
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // Black's rally is the one being resolved.
    expect(getCurrentRallyResolutionState(state)).toBe(rally);
  });

  it('returns the second player’s rally on the second resolve step', () => {
    // White chose to rally and is carrying it out.
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        secondPlayerRallyResolutionState: rally,
        step: 'secondPlayerResolveRally',
      }),
    );

    // White's rally is the one being resolved.
    expect(getCurrentRallyResolutionState(state)).toBe(rally);
  });

  it('throws when the first player’s rally has not been opened', () => {
    // The step says black is resolving, but no rally is there.
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );

    // The state is at fault; the message names the player.
    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'No black rally resolution state found',
    );
  });

  it('throws when the second player’s rally has not been opened', () => {
    // The step says white is resolving, but no rally is there.
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );

    // The state is at fault; the message names the player.
    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'No white rally resolution state found',
    );
  });

  it('throws while this round’s cards leave play', () => {
    // The step before any rally (§4.5.1).
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    // No rally is being resolved yet.
    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'Not in a resolveRally step: cardsLeavePlay',
    );
  });
});
