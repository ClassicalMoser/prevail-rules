import type { MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRetreatAwaitingMove } from './findRetreatAwaitingMove';

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

describe('findRetreatAwaitingMove function', () => {
  // A retreat already chosen: one step straight back. Which retreat it is does
  // not matter here, only that the unit has one waiting to be carried out.
  const chosen: MoveDelta[] = ['step'];

  it('returns the first player retreat whose retreat is chosen', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white, legalRetreatsOf(white), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        legalRetreatsOf(white),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee, 'white');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: retreat,
      source: 'melee',
    });
  });

  it('returns the second player retreat when the first retreat is still unchosen', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, legalRetreatsOf(black), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        legalRetreatsOf(white),
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
        legalRetreatsOf(black),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee, 'white');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: retreat,
      source: 'melee',
    });
  });

  it('answers undefined when neither retreat has been chosen', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        legalRetreatsOf(white),
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
        legalRetreatsOf(black),
      ),
    });
    const state = resolveMelee(melee, 'white');

    // Each owner still has a choice to make, so no move is due yet.
    expect(findRetreatAwaitingMove(state)).toBeUndefined();
  });

  it('answers about the first player whichever colour that is', () => {
    // The slot carries the order, so black holding the initiative is read the
    // same way white holding it is.
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, legalRetreatsOf(black), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
        legalRetreatsOf(black),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee, 'black');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: retreat,
      source: 'melee',
    });
  });

  it('passes over a retreat already carried out for the one still to make', () => {
    // The second player's unit fell back first (§7.5.6) and still holds its
    // finished retreat; the first player's is the one now due.
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const done = createRetreatState(black, legalRetreatsOf(black), {
      chosenRetreatPath: chosen,
      completed: true,
    });
    const due = createRetreatState(white, legalRetreatsOf(white), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        legalRetreatsOf(white),
        { retreatState: due },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
        legalRetreatsOf(black),
        { retreatState: done },
      ),
    });
    const state = resolveMelee(melee, 'white');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: due,
      source: 'melee',
    });
  });

  it('finds the retreat a ranged attack forced', () => {
    // Outside a melee only one unit is falling back, and the parent comes
    // back with it.
    const empty = createEmptyGameState('standard');
    const defender = placed('black', 'south');
    const retreat = createRetreatState(defender, legalRetreatsOf(defender), {
      chosenRetreatPath: chosen,
    });
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          {
            attackApplyState: createAttackApplyStateWithRetreat(
              defender,
              legalRetreatsOf(defender),
              { retreatState: retreat },
            ),
            defendingUnit: defender.unit,
          },
        ),
      }),
    );

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: retreat,
      source: 'rangedAttack',
    });
  });
});
