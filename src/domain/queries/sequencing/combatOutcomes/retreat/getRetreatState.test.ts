import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRetreatState } from './getRetreatState';

describe('getRetreatState function', () => {
  it('returns the retreat that player is making', () => {
    // A shot drove White's unit back.
    const empty = createEmptyGameState('standard');
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(
      defender.unit,
      legalRetreatsOf(defender),
    );
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender.unit,
        legalRetreatsOf(defender),
        {
          retreatState: retreat,
        },
      ),
      defendingUnit: defender.unit,
    });
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: resolution,
      }),
    );

    expect(getRetreatState(state, 'white')).toBe(retreat);
  });

  it('throws when that player is not retreating', () => {
    const empty = createEmptyGameState('standard');
    // Choosing a destination and moving the unit both run after the retreat
    // was opened, so a caller reaching here without one is out of sequence.
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(() => getRetreatState(state, 'white')).toThrow(
      'No retreat is in play for white',
    );
  });
});
