import type { UnitWithPlacement } from '@entities';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRout,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRoutAwaitingPenalty } from './findRoutAwaitingPenalty';

describe('findRoutAwaitingPenalty function', () => {
  it('finds the rout a retreat with nowhere to go fell into', () => {
    // This is the rout `resolveRout` has to work the penalty out for, and it
    // sits on the retreat while the attack's own rout slot stays bypassed.
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('black', { attack: 2 });
    const standing: UnitWithPlacement = {
      placement: createUnitPlacement('E-5', 'north'),
      unit: defender,
    };
    const nested = createRoutState('black', defender);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          {
            attackApplyState: createAttackApplyStateWithRetreat(standing, {
              retreatState: createRetreatState(standing, {
                legalRetreatPaths: [],
                routState: nested,
              }),
            }),
            defendingUnit: defender,
          },
        ),
      }),
    );

    expect(findRoutAwaitingPenalty(state)).toStrictEqual({
      routState: nested,
      source: 'retreat',
    });
  });

  it('answers undefined once the penalty is known', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          {
            attackApplyState: createAttackApplyStateWithRout(defender, {
              routState: createRoutState('white', defender, {
                numberToDiscard: 2,
              }),
            }),
            defendingUnit: defender,
          },
        ),
      }),
    );

    expect(findRoutAwaitingPenalty(state)).toBeUndefined();
  });
});
