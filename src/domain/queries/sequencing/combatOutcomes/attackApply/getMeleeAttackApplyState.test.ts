import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getMeleeAttackApplyState } from './getMeleeAttackApplyState';

/**
 * A melee holds one apply per unit, each in the slot named for its owner's
 * place in the round, so the player asked about picks the slot.
 */
describe('getMeleeAttackApplyState function', () => {
  it.each(['white', 'black'] as const)(
    'returns each side its own apply when %s holds the initiative',
    (firstPlayer) => {
      // The slots carry the order and the applies carry their owners, so the
      // two must agree whichever colour is first. An inverted mapping would
      // hand each side the other side's apply and still typecheck.
      const empty = updateCurrentInitiative(
        createEmptyGameState('standard'),
        firstPlayer,
      );
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      // Each unit took the other's blow and reached nothing.
      const firstApply = createAttackApplyStateWithNothingDue(
        createTestUnit(firstPlayer, { attack: 2 }),
      );
      const secondApply = createAttackApplyStateWithNothingDue(
        createTestUnit(secondPlayer, { attack: 2 }),
      );
      const melee = createMeleeResolutionState(empty, {
        attackOnFirstPlayerApplyState: firstApply,
        attackOnSecondPlayerApplyState: secondApply,
      });
      const state = updatePhaseState(
        empty,
        createResolveMeleePhaseState(empty, {
          currentMeleeResolutionState: melee,
        }),
      );

      // Each player is answered with the apply on their own unit.
      expect(getMeleeAttackApplyState(state, firstPlayer)).toBe(firstApply);
      expect(getMeleeAttackApplyState(state, secondPlayer)).toBe(secondApply);
    },
  );

  it('throws when the white attack apply is still pending', () => {
    // Black holds the initiative, so White's unit is in the second slot, and
    // Black's blow on it is not yet measured.
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState: 'pending',
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeAttackApplyState(state, 'white')).toThrow(
      'No attack apply on white found in melee resolution',
    );
  });
});
