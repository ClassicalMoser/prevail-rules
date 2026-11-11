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

import { getRangedAttackRoutState } from './getRangedAttackRoutState';

/** Issue-commands phase resolving the ranged attack this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createIssueCommandsPhaseState(empty, {
    currentCommandResolutionState: resolution,
  });
  const issuing = updatePhaseState(empty, phaseState);
  return issuing;
}

describe('getRangedAttackRoutState function', () => {
  it('returns the rout opened on the ranged attack', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // A ranged attack holds one apply, so no player argument is needed.
    const rout = createRoutState('white', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(getRangedAttackRoutState(state)).toBe(rout);
  });

  it('throws when the ranged attack has not opened its apply', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const state = issueCommands(resolution);

    expect(() => getRangedAttackRoutState(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the ranged attack applied no rout', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached nothing, so every outcome on it is bypassed.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithNothingDue(defender),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(() => getRangedAttackRoutState(state)).toThrow(
      'The ranged attack applied no rout',
    );
  });
});
