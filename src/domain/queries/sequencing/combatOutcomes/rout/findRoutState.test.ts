import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRout,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRoutState } from './findRoutState';

/** Issue-commands phase resolving the command this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createIssueCommandsPhaseState(empty, {
    currentCommandResolutionState: resolution,
  });
  const issuing = updatePhaseState(empty, phaseState);
  return issuing;
}

/**
 * The rout `findRoutLocation` finds, without the parent holding it. Where the
 * walk looks is that query's spec; this one shows only what is handed back.
 */
describe('findRoutState function', () => {
  it('finds the rout a ranged attack opened', () => {
    const empty = createEmptyGameState('standard');
    // The shot reached White's unit's Rout.
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });

    // The rout itself, with no parent beside it.
    expect(findRoutState(issueCommands(resolution), 'white')).toBe(rout);
  });

  it('answers undefined when the attack routed nobody', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached no threshold, so its rout slot is bypassed.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithNothingDue(defender),
      defendingUnit: defender,
    });

    expect(findRoutState(issueCommands(resolution), 'white')).toBeUndefined();
  });
});
