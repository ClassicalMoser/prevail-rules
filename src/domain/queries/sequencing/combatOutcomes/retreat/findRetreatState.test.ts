import type { UnitWithPlacement } from '@entities';
import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRetreatState } from './findRetreatState';

function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  return updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    }),
  );
}
function placed(
  player: 'white' | 'black',
  facing: UnitWithPlacement['placement']['facing'],
): UnitWithPlacement {
  const unit = createTestUnit(player, { attack: 2 });
  const placement = createUnitPlacement('E-5', facing);
  const standing = { placement, unit };
  return standing;
}

describe('findRetreatState function', () => {
  it('returns the retreat without the parent holding it', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender, legalRetreatsOf(defender));
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender,
        legalRetreatsOf(defender),
        { retreatState: retreat },
      ),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('answers undefined when the player is not retreating', () => {
    // A move that opened no engagement forces no retreat, which is ordinary.
    const empty = createEmptyGameState('standard');
    const state = issueCommands(createMovementResolutionState(empty));

    expect(findRetreatState(state, 'white')).toBeUndefined();
  });
});
