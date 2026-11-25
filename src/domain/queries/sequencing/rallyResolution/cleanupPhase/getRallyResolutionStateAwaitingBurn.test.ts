import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionStateAwaitingBurn } from './getRallyResolutionStateAwaitingBurn';

/**
 * A player who chose to rally burns one played card at random and takes the
 * rest back (§10.3.2), once.
 */
describe('getRallyResolutionStateAwaitingBurn function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('returns the rally waiting for the burn', () => {
    // Black chose to rally, and nothing has been burnt yet.
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // Black's rally, ready to burn.
    expect(getRallyResolutionStateAwaitingBurn(state, 'black')).toBe(rally);
  });

  it('throws when the player did not rally', () => {
    // Black declined, so there is nothing to burn (§10.3.4).
    const rally = createRallyResolutionState({ playerRallied: false });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // Burning a declined rally is out of turn.
    expect(() => getRallyResolutionStateAwaitingBurn(state, 'black')).toThrow(
      'Player did not choose to rally',
    );
  });

  it('throws when the rally burn is already done', () => {
    // Black has burnt a card and taken the rest back.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
    });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // A rally burns once.
    expect(() => getRallyResolutionStateAwaitingBurn(state, 'black')).toThrow(
      'Rally has already been resolved',
    );
  });

  it('throws while this round’s cards leave play', () => {
    // The step before either rally (§4.5.1).
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    // No rally is being resolved; the message names the step.
    expect(() => getRallyResolutionStateAwaitingBurn(state, 'black')).toThrow(
      'Cleanup phase is not on a resolveRally step: cardsLeavePlay',
    );
  });
});
