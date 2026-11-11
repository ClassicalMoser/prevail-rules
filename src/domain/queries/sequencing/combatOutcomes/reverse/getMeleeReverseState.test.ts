import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithReverse,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createReverseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeReverseState } from './getMeleeReverseState';

/** Resolve-melee phase holding the melee this test built. */
function resolveMelee(melee: MeleeResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createResolveMeleePhaseState(empty, {
    currentMeleeResolutionState: melee,
  });
  const resolving = updatePhaseState(empty, phaseState);
  return resolving;
}

describe('getMeleeReverseState function', () => {
  it('returns the reverse opened on that side of the melee', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('black', { attack: 2 });
    // A melee holds one apply per side, so the player argument picks the side.
    const reverse = createReverseState(defender);
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithReverse(defender, {
        reverseState: reverse,
      }),
    });
    const state = resolveMelee(melee);

    expect(getMeleeReverseState(state, 'black')).toBe(reverse);
  });

  it('throws when that side has not opened its attack apply', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: 'pending',
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeReverseState(state, 'black')).toThrow(
      'No black attack apply state found in melee resolution',
    );
  });

  it('throws when the attack on that side applied no reverse', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('black', { attack: 2 });
    // The attack reached nothing, so every outcome on it is bypassed.
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState:
        createAttackApplyStateWithNothingDue(defender),
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeReverseState(state, 'black')).toThrow(
      'The melee attack on black applied no reverse',
    );
  });
});
