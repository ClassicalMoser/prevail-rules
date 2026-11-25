import { createEmptyGameState } from '@factories';
import { createMeleeResolutionState } from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { getMeleeCommitmentForPlayer } from './getMeleeCommitmentForPlayer';

describe('getMeleeCommitmentForPlayer function', () => {
  // Black holds the initiative, so black was asked to commit first (§7.2.2).
  const state = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  // Black has refused; white has not yet answered.
  const melee = createMeleeResolutionState(state, {
    firstPlayerCommitment: { commitmentType: 'declined' },
    secondPlayerCommitment: { commitmentType: 'pending' },
  });

  it('gives the side with initiative the commitment made first', () => {
    // Black's own answer is the refusal.
    expect(getMeleeCommitmentForPlayer(state, melee, 'black')).toStrictEqual({
      commitmentType: 'declined',
    });
  });

  it('gives the other side the commitment made second', () => {
    // White's own answer is still to come.
    expect(getMeleeCommitmentForPlayer(state, melee, 'white')).toStrictEqual({
      commitmentType: 'pending',
    });
  });
});
