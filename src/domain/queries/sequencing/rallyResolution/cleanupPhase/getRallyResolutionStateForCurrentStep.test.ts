import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

/**
 * Only the player whose resolve step it is carries their rally out; the first
 * player's comes before the second's (§10.3.6).
 */
describe('getRallyResolutionStateForCurrentStep function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('returns the first player’s rally when that player is resolving', () => {
    // Black chose to rally and is carrying it out.
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // Black's own rally.
    expect(getRallyResolutionStateForCurrentStep(state, 'black')).toBe(rally);
  });

  it('returns the second player’s rally when that player is resolving', () => {
    // White chose to rally and is carrying it out.
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        secondPlayerRallyResolutionState: rally,
        step: 'secondPlayerResolveRally',
      }),
    );

    // White's own rally.
    expect(getRallyResolutionStateForCurrentStep(state, 'white')).toBe(rally);
  });

  it('throws when the second player calls during the first resolve', () => {
    // Black is carrying out their rally.
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          playerRallied: true,
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    // White asking now is out of turn; the message names both.
    expect(() => getRallyResolutionStateForCurrentStep(state, 'white')).toThrow(
      'Expected black (first player) to resolve rally, got white',
    );
  });

  it('throws when the first player calls during the second resolve', () => {
    // White is on their resolve step; black's turn is over.
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );

    // Black asking now is out of turn; the message names both.
    expect(() => getRallyResolutionStateForCurrentStep(state, 'black')).toThrow(
      'Expected white (second player) to resolve rally, got black',
    );
  });

  it('throws while this round’s cards leave play', () => {
    // The step before either rally (§4.5.1).
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    // No rally is being resolved; the message names the step.
    expect(() => getRallyResolutionStateForCurrentStep(state, 'black')).toThrow(
      'Cleanup phase is not on a resolveRally step: cardsLeavePlay',
    );
  });
});
