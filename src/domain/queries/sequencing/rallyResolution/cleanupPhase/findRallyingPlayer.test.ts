import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRallyingPlayer } from './findRallyingPlayer';

/**
 * The first player chooses whether to rally and carries it out, then the
 * second does the same (§10.3). The cards leaving play comes before
 * both rallies, and completing the round after.
 */
describe('findRallyingPlayer function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('names the first player on both of the first player’s rally steps', () => {
    // Black chooses, then black carries the rally out.
    const choosing = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    const resolving = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );

    // Both steps are black's.
    expect(findRallyingPlayer(choosing)).toBe('black');
    expect(findRallyingPlayer(resolving)).toBe('black');
  });

  it('names the second player on both of the second player’s rally steps', () => {
    // White chooses, then white carries the rally out.
    const choosing = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'secondPlayerChooseRally' }),
    );
    const resolving = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );

    // Both steps are white's.
    expect(findRallyingPlayer(choosing)).toBe('white');
    expect(findRallyingPlayer(resolving)).toBe('white');
  });

  it('names nobody before the rallies or after them', () => {
    // The cards leave play before either rally, and the round ends after both.
    const cardsLeaving = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );
    const complete = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({ step: 'complete' }),
    );

    // Neither step belongs to a rally, and that is an ordinary answer.
    expect(findRallyingPlayer(cardsLeaving)).toBeUndefined();
    expect(findRallyingPlayer(complete)).toBeUndefined();
  });
});
