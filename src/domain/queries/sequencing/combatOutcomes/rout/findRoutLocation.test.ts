import type { UnitWithPlacement } from '@entities';
import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
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

  it('finds no rally rout once cleanup is past the rallies', () => {
    // White holds initiative, so black rallied second. Black's rally routed a
    // unit and the step has moved on to the end of the round.
    const empty = createEmptyGameState('standard');
    const unit = createTestUnit('black', { attack: 2 });
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({
        secondPlayerRallyResolutionState: createRallyResolutionState({
          routState: createRoutState('black', unit),
        }),
        step: 'complete',
      }),
    );

    // No rally is being resolved on this step, so there is no rally rout to
    // locate, whatever a finished rally still holds.
    expect(findRoutLocation(state, 'black')).toBeUndefined();
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
      attackApplyState: createAttackApplyStateWithRetreat(
        standing,
        legalRetreatsOf(standing),
        {
          retreatState: createRetreatState(
            standing,
            legalRetreatsOf(standing, [enemyCuttingOffRetreat(standing)]),
            {
              routState: nested,
            },
          ),
        },
      ),
      defendingUnit: defender,
    });

    expect(findRoutLocation(issueCommands(resolution), 'black')).toStrictEqual({
      routState: nested,
      source: 'retreat',
    });
  });

  it('throws on a rout inside a front engagement’s retreat, which cannot happen', () => {
    // A defender met head-on is offered a retreat only if it has somewhere to
    // go (§6.3.2), so it never falls into a rout from that retreat. Finding
    // one means the state was built wrong.
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('black', { attack: 2 });
    const standing: UnitWithPlacement = {
      placement: createUnitPlacement('E-5', 'north'),
      unit: defender,
    };
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState({
        retreatState: createRetreatState(
          standing,
          legalRetreatsOf(standing, [enemyCuttingOffRetreat(standing)]),
          { routState: createRoutState('black', defender) },
        ),
      }),
    });

    expect(() => findRoutLocation(issueCommands(resolution), 'black')).toThrow(
      'A front engagement’s retreat holds a rout',
    );
  });
});
