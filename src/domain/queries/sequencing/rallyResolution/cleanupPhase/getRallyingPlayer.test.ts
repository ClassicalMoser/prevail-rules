import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyingPlayer } from './getRallyingPlayer';

describe('getRallyingPlayer function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('names the first player on both of their rally steps', () => {
    // Choosing and carrying out a rally are the same player's turn.
    const choosing = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    const resolving = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );

    // Both steps are black's.
    expect(getRallyingPlayer(choosing)).toBe('black');
    expect(getRallyingPlayer(resolving)).toBe('black');
  });

  it('names the second player on both of their rally steps', () => {
    // White chooses, then carries the rally out.
    const choosing = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'secondPlayerChooseRally' }),
    );
    const resolving = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );

    // Both steps are white's.
    expect(getRallyingPlayer(choosing)).toBe('white');
    expect(getRallyingPlayer(resolving)).toBe('white');
  });

  it('throws while this round’s cards leave play, before any rally', () => {
    // The step before either rally (§4.5.1).
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    // Asking whose rally it is here is out of turn; the message names the step.
    expect(() => getRallyingPlayer(state)).toThrow(
      'Cleanup phase is not on a rally step: cardsLeavePlay',
    );
  });
});
