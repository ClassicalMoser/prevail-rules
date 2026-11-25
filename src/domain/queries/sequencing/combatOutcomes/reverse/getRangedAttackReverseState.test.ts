import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithReverse,
  createGameStateResolvingCommand,
  createRangedAttackResolutionState,
  createReverseState,
  createTestUnit,
} from '@testing';

import { getRangedAttackReverseState } from './getRangedAttackReverseState';

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
    const state = createGameStateResolvingCommand(resolution);

    expect(getRangedAttackReverseState(state)).toBe(reverse);
  });

  it('throws when the ranged attack has not opened its apply', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const state = createGameStateResolvingCommand(resolution);

    expect(() => getRangedAttackReverseState(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the ranged attack applied no reverse', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached nothing, so every outcome on it is bypassed.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithNothingDue(defender),
      defendingUnit: defender,
    });
    const state = createGameStateResolvingCommand(resolution);

    expect(() => getRangedAttackReverseState(state)).toThrow(
      'The ranged attack applied no reverse',
    );
  });
});
