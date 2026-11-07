import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getAttackApplyStateAt } from './getAttackApplyStateAt';

describe('getAttackApplyStateAt function', () => {
  it('reads the ranged attack apply when the context names one', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender,
    });
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: resolution,
      }),
    );

    expect(
      getAttackApplyStateAt(state, {
        attackResolutionContext: 'rangedAttack',
      }),
    ).toBe(apply);
  });

  it('reads the named side of the melee when the context is a melee', () => {
    const empty = createEmptyGameState('standard');
    const blackDefender = createTestUnit('black', { attack: 2 });
    const blackApply = createAttackApplyState(blackDefender);
    // A melee holds an apply per side, so the location carries the side.
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: blackApply,
    });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(
      getAttackApplyStateAt(state, {
        attackResolutionContext: 'melee',
        defendingPlayer: 'black',
      }),
    ).toBe(blackApply);
  });

  it('throws when that resolution has not opened its apply', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: resolution,
      }),
    );

    expect(() =>
      getAttackApplyStateAt(state, {
        attackResolutionContext: 'rangedAttack',
      }),
    ).toThrow('No attack apply state found in ranged attack resolution');
  });
});
