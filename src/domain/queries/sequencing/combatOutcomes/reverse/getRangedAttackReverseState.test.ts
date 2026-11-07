import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithReverse,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createReverseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRangedAttackReverseState } from './getRangedAttackReverseState';

/** Issue-commands phase resolving the ranged attack this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createIssueCommandsPhaseState(empty, {
    currentCommandResolutionState: resolution,
  });
  const issuing = updatePhaseState(empty, phaseState);
  return issuing;
}

describe('getRangedAttackReverseState function', () => {
  it('returns the reverse opened on the ranged attack', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // A ranged attack holds one apply, so no player argument is needed.
    const reverse = createReverseState(defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithReverse(defender, {
        reverseState: reverse,
      }),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(getRangedAttackReverseState(state)).toBe(reverse);
  });

  it('throws when the ranged attack has not opened its apply', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const state = issueCommands(resolution);

    expect(() => getRangedAttackReverseState(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the ranged attack applied no reverse', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached nothing, so every outcome on it is bypassed.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyState(defender),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(() => getRangedAttackReverseState(state)).toThrow(
      'The ranged attack applied no reverse',
    );
  });
});
