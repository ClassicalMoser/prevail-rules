import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRout,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getMeleeAttackApplyState } from './getMeleeAttackApplyState';

describe('getMeleeAttackApplyState function', () => {
  it('returns the white attack apply', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const apply = createAttackApplyStateWithNothingDue(
      createTestUnit('white', { attack: 2 }),
      { completed: true },
    );
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: apply,
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMeleeAttackApplyState(state, 'white')).toBe(apply);
  });

  it('returns the black attack apply', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const apply = createAttackApplyStateWithRout(
      createTestUnit('black', { attack: 2 }),
    );
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: apply,
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMeleeAttackApplyState(state, 'black')).toBe(apply);
  });

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
      const firstApply = createAttackApplyStateWithNothingDue(
        createTestUnit(firstPlayer, { attack: 2 }),
      );
      const secondApply = createAttackApplyStateWithNothingDue(
        createTestUnit(secondPlayer, { attack: 2 }),
      );
      const melee = createMeleeResolutionState(empty, {
        firstPlayerAttackApplyState: firstApply,
        secondPlayerAttackApplyState: secondApply,
      });
      const state = updatePhaseState(
        empty,
        createResolveMeleePhaseState(empty, {
          currentMeleeResolutionState: melee,
        }),
      );

      expect(
        getMeleeAttackApplyState(state, firstPlayer).defendingUnit.playerSide,
      ).toBe(firstPlayer);
      expect(
        getMeleeAttackApplyState(state, secondPlayer).defendingUnit.playerSide,
      ).toBe(secondPlayer);
    },
  );

  it('throws when the white attack apply is still pending', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: 'pending',
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeAttackApplyState(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});
