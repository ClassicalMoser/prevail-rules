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

import { getNextMeleeRoutState } from './getNextMeleeRoutState';

describe('getNextMeleeRoutState function', () => {
  /**
   * A melee holding the given routs. `firstPlayer` says which colour holds the
   * initiative, so a test can show the answer follows the slot, not the colour.
   */
  function meleeWithRouts(
    firstPlayer: 'white' | 'black',
    routs: { first?: RoutState; second?: RoutState },
  ): GameState {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      firstPlayer,
    );
    const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
    const firstUnit = createTestUnit(firstPlayer, { attack: 2 });
    const secondUnit = createTestUnit(secondPlayer, { attack: 2 });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyState(firstUnit, {
        routState: routs.first ?? 'pending',
      }),
      secondPlayerAttackApplyState: createAttackApplyState(secondUnit, {
        routState: routs.second ?? 'pending',
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
    const state = meleeWithRouts('black', { first: rout });

    expect(getNextMeleeRoutState(state)).toBe(rout);
  });

  it('returns the second player rout when the first apply has none', () => {
    const rout = createRoutState(
      'white',
      createTestUnit('white', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const state = meleeWithRouts('black', { second: rout });

    expect(getNextMeleeRoutState(state)).toBe(rout);
  });

  it("returns the second player's rout first when both are owed (§7.5.6)", () => {
    // The first player's blow lands first, so the second player's unit routs
    // first.
    const firstRout = createRoutState(
      'black',
      createTestUnit('black', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const secondRout = createRoutState(
      'white',
      createTestUnit('white', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const state = meleeWithRouts('black', {
      first: firstRout,
      second: secondRout,
    });

    expect(getNextMeleeRoutState(state)).toBe(secondRout);
  });

  it('passes over a rout that is already paid', () => {
    // The second player's rout resolves first and has been paid; the first
    // player's is still owed, and is the one asked for next.
    const firstRout = createRoutState(
      'black',
      createTestUnit('black', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const secondRout = createRoutState(
      'white',
      createTestUnit('white', { attack: 2 }),
      { cardsChosen: true, completed: true, numberToDiscard: 1 },
    );
    const state = meleeWithRouts('black', {
      first: firstRout,
      second: secondRout,
    });

    expect(getNextMeleeRoutState(state)).toBe(firstRout);
  });

  it('throws when neither apply has a rout', () => {
    const state = meleeWithRouts('white', {});

    expect(() => getNextMeleeRoutState(state)).toThrow(
      'No rout state found in melee resolution',
    );
  });
});
