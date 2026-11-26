import { createEmptyGameState } from '@factories';
import { getMeleeResolutionState } from '@queries';
import {
  createGameStateResolvingMelee,
  createMeleeResolutionState,
} from '@testing';

import { updateMeleeResolutionState } from './updateMeleeResolutionState';

/**
 * In Phase 4 each engagement is fought completely before the next is chosen
 * (§4.4.2). This writer carries the melee being fought forward; it does not
 * choose one.
 */
describe('updateMeleeResolutionState function', () => {
  it('replaces the melee being fought with its next state', () => {
    // The melee at E-5 is being fought.
    const empty = createEmptyGameState('standard');
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(empty),
    );

    // The melee is carried on: the first player has yet to commit after all.
    const carried = createMeleeResolutionState(empty, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });
    const after = updateMeleeResolutionState(fighting, carried);

    // The melee being fought is the one carried on.
    expect(getMeleeResolutionState(after)).toBe(carried);
  });

  it('throws between melees, since there is nothing to carry forward', () => {
    // Phase 4, with the first player still to choose the next engagement.
    const between = createGameStateResolvingMelee('pending');
    const melee = createMeleeResolutionState(createEmptyGameState('standard'));

    expect(() => updateMeleeResolutionState(between, melee)).toThrow(
      'No current melee resolution state found',
    );
  });
});
