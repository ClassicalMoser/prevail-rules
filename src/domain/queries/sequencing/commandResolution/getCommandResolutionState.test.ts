import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';

import {
  getCurrentCommandResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
} from './getCommandResolutionState';

import { createEmptyGameState } from '@factories';
/**
 * Command-resolution accessors under issueCommands or resolveMelee: narrow CRS type, validate
 * pending commitments before strike calculation, and surface typed movement/ranged/melee slices.
 */
describe(getCurrentCommandResolutionState, () => {
  it('given issueCommands with movement CRS, returns movement commandResolutionType', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    const result = getCurrentCommandResolutionState(state);
    expect(result.commandResolutionType).toBe('movement');
  });

  it('given resolveMelee phase, throws not in issueCommands phase', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'Not in issueCommands phase',
    );
  });

  it('given issueCommands with undefined CRS, throws no current command resolution state', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'No current command resolution state',
    );
  });
});

describe(getRangedAttackResolutionState, () => {
  it('given issueCommands with ranged CRS, returns attacker defender and ranged type', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackingUnit,
            defendingUnit,
          },
        ),
      },
    );

    const result = getRangedAttackResolutionState(state);
    expect(result.commandResolutionType).toBe('rangedAttack');
    expect(result.attackingUnit).toStrictEqual(attackingUnit);
    expect(result.defendingUnit).toStrictEqual(defendingUnit);
  });

  it('given movement CRS instead of ranged, throws current command resolution is not ranged attack', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    expect(() => getRangedAttackResolutionState(state)).toThrow(
      'Current command resolution is not a ranged attack',
    );
  });
});

describe(getMovementResolutionState, () => {
  it('given movement CRS with black mover on E-5 north, returns movement and that unit', () => {
    const movingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            placement: {
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: movingUnit,
          },
        }),
      },
    );

    const result = getMovementResolutionState(state);
    expect(result.commandResolutionType).toBe('movement');
    expect(result.movingUnit.unit).toStrictEqual(movingUnit);
  });

  it('given ranged CRS, throws current command resolution is not movement', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(state),
      },
    );

    expect(() => getMovementResolutionState(state)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});
