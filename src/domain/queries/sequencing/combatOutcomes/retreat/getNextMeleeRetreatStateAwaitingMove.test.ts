import type { UnitWithPlacement } from '@entities';
import type { GameState, MeleeResolutionState, RetreatOption } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getNextMeleeRetreatStateAwaitingMove } from './getNextMeleeRetreatStateAwaitingMove';

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
function placed(
  player: 'white' | 'black',
  facing: UnitWithPlacement['placement']['facing'],
): UnitWithPlacement {
  const unit = createTestUnit(player, { attack: 2 });
  const placement = createUnitPlacement('E-5', facing);
  const standing = { placement, unit };
  return standing;
}

describe('getNextMeleeRetreatStateAwaitingMove function', () => {
  // A retreat already chosen: one step straight back. Which retreat it is does
  // not matter here, only that the unit has one waiting to be carried out.
  const chosen = {
    path: ['step'],
    placement: { coordinate: 'F-5', facing: 'north' },
  } satisfies RetreatOption;

  it('returns the first player retreat whose retreat is chosen', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white, {
      chosenRetreat: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee, 'white');

    expect(getNextMeleeRetreatStateAwaitingMove(state)).toBe(retreat);
  });

  it('returns the second player retreat when the first retreat is still unchosen', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, {
      chosenRetreat: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(white),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee, 'white');

    expect(getNextMeleeRetreatStateAwaitingMove(state)).toBe(retreat);
  });

  it('throws when neither retreat has been chosen', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(white),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(black),
    });
    const state = resolveMelee(melee, 'white');

    expect(() => getNextMeleeRetreatStateAwaitingMove(state)).toThrow(
      'No chosen retreat found in melee resolution',
    );
  });

  it('answers about the first player whichever colour that is', () => {
    // The slot carries the order, so black holding the initiative is read the
    // same way white holding it is.
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, {
      chosenRetreat: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee, 'black');

    expect(getNextMeleeRetreatStateAwaitingMove(state)).toBe(retreat);
  });
});
