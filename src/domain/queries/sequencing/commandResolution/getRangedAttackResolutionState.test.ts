import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRangedAttackResolutionState } from './getRangedAttackResolutionState';

describe('getRangedAttackResolutionState function', () => {
  it('returns the ranged resolution', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackingUnit: createTestUnit('black', { attack: 2 }),
      defendingUnit: createTestUnit('white', { attack: 2 }),
    });
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(getRangedAttackResolutionState(state)).toBe(resolution);
  });

  it('throws when the command resolution is movement', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getRangedAttackResolutionState(state)).toThrow(
      'Current command resolution is not a ranged attack',
    );
  });
});
