import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionState } from './getRallyResolutionState';

/** A caller that knows a player's rally has begun reads it here. */
describe('getRallyResolutionState function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('returns the first player’s rally', () => {
    // Black has chosen to rally.
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // Black's rally is the first.
    expect(getRallyResolutionState(state, 'black')).toBe(rally);
  });

  it('returns the second player’s rally', () => {
    // White, second, has chosen to rally.
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        secondPlayerRallyResolutionState: rally,
        step: 'secondPlayerResolveRally',
      }),
    );

    // White's rally is the second.
    expect(getRallyResolutionState(state, 'white')).toBe(rally);
  });

  it('throws before the player has chosen whether to rally', () => {
    // Black is still choosing.
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    // There is no rally to insist on; the message names the player.
    expect(() => getRallyResolutionState(state, 'black')).toThrow(
      'No black rally resolution state found',
    );
  });
});
