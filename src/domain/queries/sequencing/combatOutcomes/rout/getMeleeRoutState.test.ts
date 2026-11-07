import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeRoutState } from './getMeleeRoutState';

/** Resolve-melee phase holding the melee this test built. */
function resolveMelee(melee: MeleeResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createResolveMeleePhaseState(empty, {
    currentMeleeResolutionState: melee,
  });
  const resolving = updatePhaseState(empty, phaseState);
  return resolving;
}

describe('getMeleeRoutState function', () => {
  it('returns the rout opened on that side of the melee', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // A melee holds one apply per side, so the player argument picks the side.
    const rout = createRoutState('white', defender);
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
    });
    const state = resolveMelee(melee);

    expect(getMeleeRoutState(state, 'white')).toBe(rout);
  });

  it('throws when that side has not opened its attack apply', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: 'pending',
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeRoutState(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });

  it('throws when the attack on that side applied no rout', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached nothing, so every outcome on it is bypassed.
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: createAttackApplyState(defender),
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeRoutState(state, 'white')).toThrow(
      'The melee attack on white applied no rout',
    );
  });
});
