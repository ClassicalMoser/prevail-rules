import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import {
  getCurrentCommandResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
} from './getCommandResolutionState';

/**
 * Issue-commands readers. The current slice must be a command resolution.
 * The ranged and movement readers narrow that slice.
 */
describe('getCurrentCommandResolutionState function', () => {
  it('returns the command resolution on the issue-commands phase', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(getCurrentCommandResolutionState(state)).toBe(resolution);
  });

  it('throws when the phase is resolve melee', () => {
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'Not in issueCommands phase',
    );
  });

  it('throws when command resolution is still pending', () => {
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'No current command resolution state',
    );
  });
});

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
