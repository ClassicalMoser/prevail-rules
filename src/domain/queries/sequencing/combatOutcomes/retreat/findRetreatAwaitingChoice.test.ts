import type { MoveDelta } from '@entities';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createRetreatState,
  createUnitWithPlacement,
} from '@testing';

import { findRetreatAwaitingChoice } from './findRetreatAwaitingChoice';

describe('findRetreatAwaitingChoice function', () => {
  // Two equally small ways back. The selection does not judge them, only that
  // the owner has a choice among them still to make.
  const twoWaysBack: MoveDelta[][] = [['step'], ['step', 'step']];

  it('returns the retreat whose owner has not yet chosen among several ways back', () => {
    // White's unit was driven back and has two equally small ways to go.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(white.unit, twoWaysBack);
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        twoWaysBack,
        { retreatState: retreat },
      ),
    });

    expect(
      findRetreatAwaitingChoice(createGameStateResolvingMelee(melee, 'white')),
    ).toStrictEqual({ retreatState: retreat, source: 'melee' });
  });

  it('answers undefined once the owner has chosen', () => {
    // White picked the first of its two ways back.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const chosen = createRetreatState(white.unit, twoWaysBack, {
      chosenRetreatPath: ['step'],
    });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        twoWaysBack,
        { retreatState: chosen },
      ),
    });

    // The way back is settled, so nothing is waiting on a choice.
    expect(
      findRetreatAwaitingChoice(createGameStateResolvingMelee(melee, 'white')),
    ).toBeUndefined();
  });

  it('answers undefined for a retreat with nowhere to go', () => {
    // White's unit has no legal way back, so it routs instead (§9.1.6) and
    // has nothing to choose among.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        [],
      ),
    });

    expect(
      findRetreatAwaitingChoice(createGameStateResolvingMelee(melee, 'white')),
    ).toBeUndefined();
  });

  it('asks after the second player’s unit first, since it suffers first (§7.5.6)', () => {
    // Both units were driven back and both owners have a choice to make.
    const empty = createEmptyGameState('standard');
    const white = createUnitWithPlacement({ playerSide: 'white' });
    const black = createUnitWithPlacement({
      facing: 'south',
      playerSide: 'black',
    });
    const whiteRetreat = createRetreatState(white.unit, twoWaysBack);
    const blackRetreat = createRetreatState(black.unit, twoWaysBack);
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        twoWaysBack,
        { retreatState: whiteRetreat },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        twoWaysBack,
        { retreatState: blackRetreat },
      ),
    });

    // White holds initiative and is the first player; black's unit is asked
    // after first.
    expect(
      findRetreatAwaitingChoice(createGameStateResolvingMelee(melee, 'white')),
    ).toStrictEqual({ retreatState: blackRetreat, source: 'melee' });
  });
});
