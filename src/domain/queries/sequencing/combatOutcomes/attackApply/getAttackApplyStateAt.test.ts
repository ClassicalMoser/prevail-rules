import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getAttackApplyStateAt } from './getAttackApplyStateAt';

describe('getAttackApplyStateAt function', () => {
  it('reads the ranged attack apply when the context names one', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const defender = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyStateWithNothingDue(defender);
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
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const blackDefender = createTestUnit('black', { attack: 2 });
    const blackApply = createAttackApplyStateWithNothingDue(blackDefender);
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
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
