import type { MoveDelta } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  enemyBlockingStraightBack,
  legalRetreatsOf,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateResolveRetreatEvent } from './generateResolveRetreatEvent';

// TODO(misleading): the event carries the unit and its path, not a starting
// placement or an ending; and in a melee the second player's unit falls back
// first, not the initiative player's (§7.5.6). Settle by rewording the header.
/**
 * `resolveRetreat` closes a legal retreat: starting placement is the defender on the board,
 * the way back is whatever path and ending the retreat substep recorded. Ranged stacks nest retreat under
 * one defender’s attack-apply; melee can hold two retreats and the procedure picks the
 * initiative player’s path first.
 */
describe('generateResolveRetreatEvent function', () => {
  // A unit on E-5 falls straight back one step, whichever way it faces: the
  // path names the move, and where it ends follows from the way the unit faces.
  const stepBack: MoveDelta[] = ['step'];

  // White's unit on E-5 facing north, and the black archer that shot at it
  // from two spaces ahead.
  const target = placed(createTestUnit('white', { attack: 2 }), 'E-5', 'north');
  const shooter = placed(
    createTestUnit('black', { attack: 2 }),
    'C-5',
    'south',
  );

  it("carries out a shot's retreat along the one way back it has", () => {
    const board = createGameStateWithUnits([target, shooter]);
    // Open ground behind: the unit's only way back is the step already chosen.
    const openGround = legalRetreatsOf(target, [shooter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithRetreat(
        target.unit,
        openGround,
      ),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    // The unit, by identity, and its path; where it lands is the apply's to
    // read from the board.
    expect(generateResolveRetreatEvent(state)).toStrictEqual({
      effectType: 'resolveRetreat',
      eventType: 'gameEffect',
      path: ['step'],
      unit: target.unit,
    });
  });

  it("with both retreats ready, the second player's unit falls back first (§7.5.6)", () => {
    const whiteWp = placed(
      createTestUnit('white', { attack: 2 }),
      'E-5',
      'north',
    );
    const blackWp = placed(
      createTestUnit('black', { attack: 2 }),
      'E-5',
      'south',
    );
    const board = createGameStateWithUnits([whiteWp, blackWp]);

    // Each engaged unit has open ground behind it, and has already chosen the
    // step back.
    const whitePaths = legalRetreatsOf(whiteWp, [blackWp]);
    const blackPaths = legalRetreatsOf(blackWp, [whiteWp]);
    const whiteRetreat = createRetreatState(whiteWp.unit, whitePaths, {
      chosenRetreatPath: stepBack,
    });
    const blackRetreat = createRetreatState(blackWp.unit, blackPaths, {
      chosenRetreatPath: stepBack,
    });

    const melee = createMeleeResolutionState(board, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        whiteWp.unit,
        whitePaths,
        { retreatState: whiteRetreat },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        blackWp.unit,
        blackPaths,
        { retreatState: blackRetreat },
      ),
    });
    const full = updatePhaseState(
      board,
      createResolveMeleePhaseState(board, {
        currentMeleeResolutionState: melee,
      }),
    );

    // White holds initiative and strikes first, so black's unit, the second
    // player's, is the one that falls back first.
    const event = generateResolveRetreatEvent(full);
    expect(event.unit).toBe(blackWp.unit);
    expect(event.path).toStrictEqual(['step']);
  });

  it('throws outside any combat, where no retreat can be waiting to move', () => {
    // Playing cards resolves no attack, so nothing can be retreating.
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRetreatEvent(full)).toThrow(
      'Retreat resolution not expected in phase: playCards',
    );
  });

  it('throws while the owner has still to choose the way back', () => {
    // An enemy holds the step straight back, so the target has two equally
    // small retreats and its owner has not picked one yet (§9.1.3).
    const blocker = enemyBlockingStraightBack(target);
    const board = createGameStateWithUnits([target, shooter, blocker]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithRetreat(
        target.unit,
        legalRetreatsOf(target, [shooter, blocker]),
      ),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    expect(() => generateResolveRetreatEvent(state)).toThrow(
      'No retreat has been chosen yet',
    );
  });

  it("throws in a melee while the falling-back unit's owner has still to choose", () => {
    // White holds the initiative, so black's unit falls back first. A white
    // unit behind it holds its straight step back, leaving it two equally
    // small retreats, and black has not picked one (§9.1.3).
    const whiteWp = placed(
      createTestUnit('white', { attack: 2 }),
      'E-5',
      'north',
    );
    const blackWp = placed(
      createTestUnit('black', { attack: 2 }),
      'E-5',
      'south',
    );
    const behindBlack = enemyBlockingStraightBack(blackWp);
    const board = createGameStateWithUnits([whiteWp, blackWp, behindBlack]);

    // Black's blow reached none of white's thresholds.
    const melee = createMeleeResolutionState(board, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithNothingDue(
        whiteWp.unit,
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        blackWp.unit,
        legalRetreatsOf(blackWp, [whiteWp, behindBlack]),
      ),
    });
    const full = updatePhaseState(
      board,
      createResolveMeleePhaseState(board, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() => generateResolveRetreatEvent(full)).toThrow(
      'No chosen retreat found in melee resolution',
    );
  });
});
