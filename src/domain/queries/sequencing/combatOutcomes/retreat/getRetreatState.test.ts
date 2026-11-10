import type { UnitWithPlacement } from '@entities';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRetreatState } from './getRetreatState';

function placed(player: 'white' | 'black'): UnitWithPlacement {
  const unit = createTestUnit(player, { attack: 2 });
  const placement = createUnitPlacement('E-5', 'north');
  const standing = { placement, unit };
  return standing;
}

describe('getRetreatState function', () => {
  it('returns the retreat that player is making', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white');
    const retreat = createRetreatState(defender, legalRetreatsOf(defender));
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender,
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
