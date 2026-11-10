import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyingPlayer } from './getRallyingPlayer';

describe('getRallyingPlayer function', () => {
  // Black holds the initiative, so black rallies first (§10.3).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('names the first player on both of their rally steps', () => {
    // Choosing and carrying out a rally are the same player's turn.
    for (const step of [
      'firstPlayerChooseRally',
      'firstPlayerResolveRally',
    ] as const) {
      const state = updatePhaseState(
        blackFirst,
        createCleanupPhaseState({ step }),
      );
      expect(getRallyingPlayer(state)).toBe('black');
    }
  });

  it('names the second player on both of their rally steps', () => {
    for (const step of [
      'secondPlayerChooseRally',
      'secondPlayerResolveRally',
    ] as const) {
      const state = updatePhaseState(
        blackFirst,
        createCleanupPhaseState({ step }),
      );
      expect(getRallyingPlayer(state)).toBe('white');
    }
  });

  it('throws while the played cards are being discarded, before any rally', () => {
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    expect(() => getRallyingPlayer(state)).toThrow(
      'Cleanup phase is not on a rally step: discardPlayedCards',
    );
  });
});
