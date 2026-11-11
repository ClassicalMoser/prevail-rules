import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRangedAttackApplyState } from './getRangedAttackApplyState';

describe('getRangedAttackApplyState function', () => {
  it('returns the attack apply on the ranged resolution', () => {
    const empty = createEmptyGameState('standard');
    const apply = createAttackApplyStateWithNothingDue(
      createTestUnit('white', { attack: 2 }),
      { completed: true },
    );
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
    });
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(getRangedAttackApplyState(state)).toBe(apply);
  });

  it('throws when the ranged attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getRangedAttackApplyState(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the command resolution is movement', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getRangedAttackApplyState(state)).toThrow(
      'Current command resolution is not a ranged attack',
    );
  });
});
