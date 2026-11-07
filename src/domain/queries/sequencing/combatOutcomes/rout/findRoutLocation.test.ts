import type { UnitWithPlacement } from '@entities';
import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRoutLocation } from './findRoutLocation';

/** Issue-commands phase resolving the command this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createIssueCommandsPhaseState(empty, {
    currentCommandResolutionState: resolution,
  });
  const issuing = updatePhaseState(empty, phaseState);
  return issuing;
}

describe('findRoutLocation function', () => {
  it('names the ranged attack that routed the defender', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });

    expect(findRoutLocation(issueCommands(resolution), 'white')).toStrictEqual({
      routState: rout,
      source: 'rangedAttack',
    });
  });

  it('names the rear engagement that routed the defender', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty, {
      engagementState: createRearEngagementState(),
    });

    expect(findRoutLocation(issueCommands(resolution), 'white')?.source).toBe(
      'rearEngagementMovement',
    );
  });

  it('names the rally that routed the unsupported units', () => {
    const empty = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', unit);
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          routState: rout,
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    expect(findRoutLocation(state, 'white')).toStrictEqual({
      routState: rout,
      source: 'rally',
    });
  });

  it('names the retreat when the defender had nowhere to go', () => {
    // The rout is nested on the retreat, so it is resolved against the retreat
    // and not against the attack that forced it.
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('black', { attack: 2 });
    const standing: UnitWithPlacement = {
      placement: createUnitPlacement('E-5', 'north'),
      unit: defender,
    };
    const nested = createRoutState('black', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(standing, {
        retreatState: createRetreatState(standing, {
          legalRetreatOptions: [],
          routState: nested,
        }),
      }),
      defendingUnit: defender,
    });

    expect(findRoutLocation(issueCommands(resolution), 'black')).toStrictEqual({
      routState: nested,
      source: 'retreat',
    });
  });
});
