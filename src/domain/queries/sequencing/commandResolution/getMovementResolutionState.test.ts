import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMovementResolutionState } from './getMovementResolutionState';

describe('getMovementResolutionState function', () => {
  it('returns the movement resolution', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty, {
      movingUnit: {
        placement: { coordinate: 'D-4', facing: 'south' },
        unit: createTestUnit('black', { attack: 2 }),
      },
    });
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMovementResolutionState(state)).toBe(resolution);
  });

  it('throws when the command resolution is a ranged attack', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMovementResolutionState(state)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});
