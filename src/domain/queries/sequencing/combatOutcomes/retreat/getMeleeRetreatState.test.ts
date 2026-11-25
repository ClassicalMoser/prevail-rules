import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getMeleeRetreatState } from './getMeleeRetreatState';

/** Resolve-melee phase holding the melee this test built. */
function resolveMelee(
  melee: MeleeResolutionState,
  initiative: 'white' | 'black' = 'white',
): GameState {
  const empty = updateCurrentInitiative(
    createEmptyGameState('standard'),
    initiative,
  );
  return updatePhaseState(
    empty,
    createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    }),
  );
}

describe('getMeleeRetreatState function', () => {
  it('returns the white retreat', () => {
    // White holds the initiative, so White's unit is in the first slot.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(white.unit, legalRetreatsOf(white));
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee);

    expect(getMeleeRetreatState(state, 'white')).toBe(retreat);
  });

  it('returns the black retreat', () => {
    // Black's unit, the second player's, is in the second slot.
    const empty = createEmptyGameState('standard');
    const black = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'black',
    });
    const retreat = createRetreatState(black.unit, legalRetreatsOf(black));
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee);

    expect(getMeleeRetreatState(state, 'black')).toBe(retreat);
  });

  it('throws when the attack on that side applied no retreat', () => {
    // Black's blow on White's unit reached nothing, so it is not falling back.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithNothingDue(
        white.unit,
      ),
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeRetreatState(state, 'white')).toThrow(
      'The melee attack on white applied no retreat',
    );
  });

  it('throws when the white attack apply is still pending', () => {
    // Black's blow on White's unit is not yet measured.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: 'pending',
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeRetreatState(state, 'white')).toThrow(
      'No attack apply on white found in melee resolution',
    );
  });
});
