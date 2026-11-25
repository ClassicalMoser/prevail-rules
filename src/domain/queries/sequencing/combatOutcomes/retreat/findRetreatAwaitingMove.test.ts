import type { MoveDelta } from '@entities';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createGameStateResolvingMelee,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRetreatAwaitingMove } from './findRetreatAwaitingMove';

describe('findRetreatAwaitingMove function', () => {
  // A retreat already chosen: one step straight back. Which retreat it is does
  // not matter here, only that the unit has one waiting to be carried out.
  const chosen: MoveDelta[] = ['step'];

  it('returns the first player retreat whose retreat is chosen', () => {
    // White, the first player, has its way back settled and not yet taken.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(white.unit, legalRetreatsOf(white), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'white');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: retreat,
      source: 'melee',
    });
  });

  it('asks after the second player’s unit first when both ways back are settled', () => {
    // Each unit has one way straight back, taken as the retreat opened, and
    // neither has fallen back yet. White holds the initiative, so Black's unit
    // suffers first (§7.5.6).
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const black = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'black',
    });
    const retreat = createRetreatState(black.unit, legalRetreatsOf(black), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'white');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: retreat,
      source: 'melee',
    });
  });

  it('answers undefined when neither retreat has been chosen', () => {
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const black = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'black',
    });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        [['step'], ['turnLeft', 'step']],
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        [['step'], ['turnLeft', 'step']],
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'white');

    // Each owner has two ways back and still has a choice to make, so no move
    // is due yet.
    expect(findRetreatAwaitingMove(state)).toBeUndefined();
  });

  it('answers about the first player whichever colour that is', () => {
    // The slot carries the order, so black holding the initiative is read the
    // same way white holding it is.
    const empty = createEmptyGameState('standard');
    const black = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'black',
    });
    const retreat = createRetreatState(black.unit, legalRetreatsOf(black), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: retreat,
      source: 'melee',
    });
  });

  it('passes over a retreat already carried out for the one still to make', () => {
    // The second player's unit fell back first (§7.5.6) and still holds its
    // finished retreat; the first player's is the one now due.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const black = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'black',
    });
    const done = createRetreatState(black.unit, legalRetreatsOf(black), {
      chosenRetreatPath: chosen,
      completed: true,
    });
    const due = createRetreatState(white.unit, legalRetreatsOf(white), {
      chosenRetreatPath: chosen,
    });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        { retreatState: due },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        { retreatState: done },
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'white');

    expect(findRetreatAwaitingMove(state)).toStrictEqual({
      retreatState: due,
      source: 'melee',
    });
  });

  it('finds the retreat a ranged attack forced', () => {
    // Outside a melee only one unit is falling back, and the parent comes
    // back with it.
    const empty = createEmptyGameState('standard');
    const defender = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'black',
    });
    const retreat = createRetreatState(
      defender.unit,
      legalRetreatsOf(defender),
      {
        chosenRetreatPath: chosen,
      },
    );
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          {
            attackApplyState: createAttackApplyStateWithRetreat(
              defender.unit,
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
