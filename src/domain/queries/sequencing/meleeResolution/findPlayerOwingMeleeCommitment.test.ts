import { createEmptyGameState } from '@factories';
import { createMeleeResolutionState } from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { findPlayerOwingMeleeCommitment } from './findPlayerOwingMeleeCommitment';

/** The first player may commit first, then the second (§7.2.2). */
describe('findPlayerOwingMeleeCommitment function', () => {
  // Black holds the initiative, so black is the first player; the empty
  // game's default is white, so this is the value the test chose.
  const state = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('asks the first player first', () => {
    // Neither player has answered yet.
    const melee = createMeleeResolutionState(state, {
      firstPlayerCommitment: { commitmentType: 'pending' },
      secondPlayerCommitment: { commitmentType: 'pending' },
    });

    // Black holds initiative, so black is asked before white.
    expect(findPlayerOwingMeleeCommitment(state, melee)).toBe('black');
  });

  it('asks the second player once the first has answered', () => {
    // Black has refused; white has still to answer.
    const melee = createMeleeResolutionState(state, {
      firstPlayerCommitment: { commitmentType: 'declined' },
      secondPlayerCommitment: { commitmentType: 'pending' },
    });

    // White is asked next.
    expect(findPlayerOwingMeleeCommitment(state, melee)).toBe('white');
  });

  it('asks nobody once both have answered', () => {
    // Both players have refused.
    const melee = createMeleeResolutionState(state, {
      firstPlayerCommitment: { commitmentType: 'declined' },
      secondPlayerCommitment: { commitmentType: 'declined' },
    });

    // The attack values are next, and no one is owed a choice.
    expect(findPlayerOwingMeleeCommitment(state, melee)).toBeUndefined();
  });
});
