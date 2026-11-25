import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createRoutState,
  createUnitWithPlacement,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRetreatAwaitingRout } from './findRetreatAwaitingRout';

/** Resolve-melee phase holding the melee this test built. */
function resolveMelee(
  melee: MeleeResolutionState,
  initiative: 'white' | 'black',
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

describe('findRetreatAwaitingRout function', () => {
  it('names the first player when the retreat with nowhere to go is theirs', () => {
    // The second player's unit has already fallen back and holds its finished
    // retreat; the first player's unit has its line of withdrawal cut. The
    // finished retreat must not be mistaken for the one that routs.
    const empty = createEmptyGameState('standard');
    const black = createUnitWithPlacement({ playerSide: 'black' });
    const white = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'white',
    });
    const fellBack = createRetreatState(white.unit, legalRetreatsOf(white), {
      chosenRetreatPath: ['step'],
      completed: true,
    });
    const cutOff = createRetreatState(
      black.unit,
      legalRetreatsOf(black, [enemyCuttingOffRetreat(black)]),
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        { retreatState: cutOff },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        { retreatState: fellBack },
      ),
    });
    const state = resolveMelee(melee, 'black');

    expect(findRetreatAwaitingRout(state)).toStrictEqual({
      retreatState: cutOff,
      source: 'melee',
    });
  });

  it('names the second player when the retreat with nowhere to go is theirs', () => {
    // The first player's unit has already fallen back; the second player's has
    // its line of withdrawal cut. The second player's unit suffers first
    // (§7.5.6), and its retreat is the one still waiting.
    const empty = createEmptyGameState('standard');
    const black = createUnitWithPlacement({ playerSide: 'black' });
    const white = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'white',
    });
    const fellBack = createRetreatState(black.unit, legalRetreatsOf(black), {
      chosenRetreatPath: ['step'],
      completed: true,
    });
    const cutOff = createRetreatState(
      white.unit,
      legalRetreatsOf(white, [enemyCuttingOffRetreat(white)]),
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        { retreatState: fellBack },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        { retreatState: cutOff },
      ),
    });
    const state = resolveMelee(melee, 'black');

    expect(findRetreatAwaitingRout(state)).toStrictEqual({
      retreatState: cutOff,
      source: 'melee',
    });
  });

  it('names the second player first when both retreats have nowhere to go', () => {
    // Both units have their line of withdrawal cut. The second player's unit
    // suffers first (§7.5.6), so its rout is the one to open first.
    const empty = createEmptyGameState('standard');
    const black = createUnitWithPlacement({ playerSide: 'black' });
    const white = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'white',
    });
    const blackCutOff = createRetreatState(
      black.unit,
      legalRetreatsOf(black, [enemyCuttingOffRetreat(black)]),
    );
    const whiteCutOff = createRetreatState(
      white.unit,
      legalRetreatsOf(white, [enemyCuttingOffRetreat(white)]),
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        { retreatState: blackCutOff },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        { retreatState: whiteCutOff },
      ),
    });
    // Black holds the initiative, so White's unit is the second player's.
    const state = resolveMelee(melee, 'black');

    expect(findRetreatAwaitingRout(state)).toStrictEqual({
      retreatState: whiteCutOff,
      source: 'melee',
    });
  });

  it('answers undefined once the rout has opened on the retreat', () => {
    // The rout the retreat fell into is already open, so nothing is left for
    // `triggerRoutFromRetreat` to do.
    const empty = createEmptyGameState('standard');
    const black = createUnitWithPlacement({ playerSide: 'black' });
    const routing = createRetreatState(
      black.unit,
      legalRetreatsOf(black, [enemyCuttingOffRetreat(black)]),
      { routState: createRoutState('black', black.unit) },
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        { retreatState: routing },
      ),
    });
    const state = resolveMelee(melee, 'black');

    expect(findRetreatAwaitingRout(state)).toBeUndefined();
  });

  it('answers undefined for a retreat that has somewhere to go', () => {
    // An open line of withdrawal is a retreat to make, not a rout.
    const empty = createEmptyGameState('standard');
    const black = createUnitWithPlacement({ playerSide: 'black' });
    const open = createRetreatState(black.unit, legalRetreatsOf(black));
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        { retreatState: open },
      ),
    });
    const state = resolveMelee(melee, 'black');

    expect(findRetreatAwaitingRout(state)).toBeUndefined();
  });
});
