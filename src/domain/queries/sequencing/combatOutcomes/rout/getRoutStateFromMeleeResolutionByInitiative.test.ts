import type { GameState, RoutState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRoutStateFromMeleeResolutionByInitiative } from './getRoutStateFromMeleeResolutionByInitiative';

describe('getRoutStateFromMeleeResolutionByInitiative function', () => {
  function meleeWithRouts(
    initiative: 'white' | 'black',
    routs: { white?: RoutState; black?: RoutState },
  ): GameState {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      initiative,
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyState(blackUnit, {
        routState: routs.black ?? 'pending',
      }),
      whiteAttackApplyState: createAttackApplyState(whiteUnit, {
        routState: routs.white ?? 'pending',
      }),
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(empty, phase);
  }

  it('returns the first player rout', () => {
    const rout = createRoutState(
      'black',
      createTestUnit('black', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const state = meleeWithRouts('black', { black: rout });

    expect(getRoutStateFromMeleeResolutionByInitiative(state)).toBe(rout);
  });

  it('returns the second player rout when the first apply has none', () => {
    const rout = createRoutState(
      'white',
      createTestUnit('white', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const state = meleeWithRouts('black', { white: rout });

    expect(getRoutStateFromMeleeResolutionByInitiative(state)).toBe(rout);
  });

  it('throws when neither apply has a rout', () => {
    const state = meleeWithRouts('white', {});

    expect(() => getRoutStateFromMeleeResolutionByInitiative(state)).toThrow(
      'No rout state found in melee resolution',
    );
  });
});
