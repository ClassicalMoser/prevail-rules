import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRetreatState } from './findRetreatState';

/** Issue-commands phase resolving the command this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  return updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    }),
  );
}

describe('findRetreatState function', () => {
  it('returns the retreat without the parent holding it', () => {
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
