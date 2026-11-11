import type { MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRetreatAwaitingChoice } from './findRetreatAwaitingChoice';

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
  const standing = { placement: createUnitPlacement('E-5', facing), unit };
  return standing;
}

describe('findRetreatAwaitingChoice function', () => {
  // Two equally small ways back. The selection does not judge them, only that
  // the owner has a choice among them still to make.
  const twoWaysBack: MoveDelta[][] = [['step'], ['step', 'step']];

  it('returns the retreat whose owner has not yet chosen among several ways back', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white, twoWaysBack);
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        twoWaysBack,
        { retreatState: retreat },
      ),
    });

    expect(
      findRetreatAwaitingChoice(resolveMelee(melee, 'white')),
    ).toStrictEqual({ retreatState: retreat, source: 'melee' });
  });

  it('answers undefined once the owner has chosen', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const chosen = createRetreatState(white, twoWaysBack, {
      chosenRetreatPath: ['step'],
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        twoWaysBack,
        { retreatState: chosen },
      ),
    });

    // The way back is settled, so nothing is waiting on a choice.
    expect(
      findRetreatAwaitingChoice(resolveMelee(melee, 'white')),
    ).toBeUndefined();
  });

  it('asks after the second player’s unit first, since it suffers first (§7.5.6)', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const whiteRetreat = createRetreatState(white, twoWaysBack);
    const blackRetreat = createRetreatState(black, twoWaysBack);
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        twoWaysBack,
        { retreatState: whiteRetreat },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        black,
        twoWaysBack,
        { retreatState: blackRetreat },
      ),
    });

    // White holds initiative and is the first player; black's unit is asked
    // after first.
    expect(
      findRetreatAwaitingChoice(resolveMelee(melee, 'white')),
    ).toStrictEqual({ retreatState: blackRetreat, source: 'melee' });
  });
});
