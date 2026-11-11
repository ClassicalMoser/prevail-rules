import { createEmptyGameState } from '@factories';
import { createMeleeResolutionState } from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { findPlayerOwingMeleeCommitment } from './findPlayerOwingMeleeCommitment';

describe('findPlayerOwingMeleeCommitment function', () => {
  const state = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'white',
  );

  it('asks the first player first (§7.2.2)', () => {
    const melee = createMeleeResolutionState(state, {
      firstPlayerCommitment: { commitmentType: 'pending' },
      secondPlayerCommitment: { commitmentType: 'pending' },
    });

    // White holds initiative, so white is asked before black.
    expect(findPlayerOwingMeleeCommitment(state, melee)).toBe('white');
  });

  it('asks the second player once the first has answered', () => {
    const melee = createMeleeResolutionState(state, {
      firstPlayerCommitment: { commitmentType: 'declined' },
      secondPlayerCommitment: { commitmentType: 'pending' },
    });

    expect(findPlayerOwingMeleeCommitment(state, melee)).toBe('black');
  });

  it('asks nobody once both have answered', () => {
    const melee = createMeleeResolutionState(state, {
      firstPlayerCommitment: { commitmentType: 'declined' },
      secondPlayerCommitment: { commitmentType: 'declined' },
    });

    expect(findPlayerOwingMeleeCommitment(state, melee)).toBeUndefined();
  });
});
