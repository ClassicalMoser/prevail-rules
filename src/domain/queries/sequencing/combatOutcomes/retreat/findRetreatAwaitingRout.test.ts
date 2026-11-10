import type { UnitWithPlacement } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRetreatAwaitingRout } from './findRetreatAwaitingRout';

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
function placed(
  player: 'white' | 'black',
  facing: UnitWithPlacement['placement']['facing'],
): UnitWithPlacement {
  const unit = createTestUnit(player, { attack: 2 });
  const placement = createUnitPlacement('E-5', facing);
  const standing = { placement, unit };
  return standing;
}

describe('findRetreatAwaitingRout function', () => {
  it('names the first player when the retreat with nowhere to go is theirs', () => {
    // The second player's unit has already fallen back and holds its finished
    // retreat; the first player's unit has its line of withdrawal cut. The
    // finished retreat must not be mistaken for the one that routs.
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'north');
    const white = placed('white', 'south');
    const fellBack = createRetreatState(white, legalRetreatsOf(white), {
      chosenRetreatPath: ['step'],
      completed: true,
    });
    const cutOff = createRetreatState(
      black,
      legalRetreatsOf(black, [enemyCuttingOffRetreat(black)]),
    );
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
        legalRetreatsOf(black),
        { retreatState: cutOff },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
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

  it('answers undefined once the rout has opened on the retreat', () => {
    // The rout the retreat fell into is already open, so nothing is left for
    // `triggerRoutFromRetreat` to do.
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'north');
    const routing = createRetreatState(
      black,
      legalRetreatsOf(black, [enemyCuttingOffRetreat(black)]),
      { routState: createRoutState('black', black.unit) },
    );
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
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
    const black = placed('black', 'north');
    const open = createRetreatState(black, legalRetreatsOf(black));
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
        legalRetreatsOf(black),
        { retreatState: open },
      ),
    });
    const state = resolveMelee(melee, 'black');

    expect(findRetreatAwaitingRout(state)).toBeUndefined();
  });
});
