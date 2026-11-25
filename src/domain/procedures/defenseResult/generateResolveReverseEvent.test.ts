import { PLAY_CARDS_PHASE } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRetreatAndReverse,
  createAttackApplyStateWithReverse,
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createReverseState,
  createTestUnit,
  enemyBlockingStraightBack,
  legalRetreatsOf,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateResolveReverseEvent } from './generateResolveReverseEvent';

// TODO(misleading): a reverse is not a pivot to strike back; it stands for a
// unit thrown into disorder (§9.2). The event carries the unit and the facing
// it ends with, read from the board, not a placement from the reverse
// substep. Settle by rewording the header.
/**
 * `resolveReverse` is the defender pivoting to strike back: context is ranged vs melee,
 * unit is the reversing defender’s board placement, and new placement is the factory default
 * from the reverse substep (facing flips for the shown geometries).
 */
describe('generateResolveReverseEvent function', () => {
  // The black archer that shot, two spaces ahead of white's target on E-5.
  const shooter = placed(
    createTestUnit('black', { attack: 2 }),
    'C-5',
    'south',
  );

  it("turns a shot's target about where it stands (§9.2.1)", () => {
    // White's unit on E-5 facing north, its reverse open.
    const target = placed(
      createTestUnit('white', { attack: 2 }),
      'E-5',
      'north',
    );
    const board = createGameStateWithUnits([target, shooter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithReverse(target.unit),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    // A shot's target stands alone, so nothing stops it turning.
    expect(generateResolveReverseEvent(state)).toStrictEqual({
      effectType: 'resolveReverse',
      eventType: 'gameEffect',
      facing: 'south',
      unit: target.unit,
    });
  });

  it('turns about from the facing the retreat left, not the one the attack found', () => {
    // The shot drove white's unit back from E-5 and then reversed it (§7.5.4).
    // An enemy held the step straight back, so it turned 45° left to face
    // north-west and stepped back to F-6.
    const unit = createTestUnit('white', { attack: 2 });
    const struck = placed(unit, 'E-5', 'north');
    const blocker = enemyBlockingStraightBack(struck);
    const fellBack = placed(unit, 'F-6', 'northWest');
    const board = createGameStateWithUnits([fellBack, blocker, shooter]);

    // The retreat is carried out, and the reverse is open on its turn.
    const waysBack = legalRetreatsOf(struck, [blocker, shooter]);
    const retreatDone = createRetreatState(unit, waysBack, {
      chosenRetreatPath: ['turnLeft', 'step'],
      completed: true,
    });
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithRetreatAndReverse(
        unit,
        waysBack,
        { retreatState: retreatDone, reverseState: createReverseState(unit) },
      ),
      attackingUnit: shooter.unit,
      defendingUnit: unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    // Turned about from north-west, where it stands now.
    expect(generateResolveReverseEvent(state).facing).toBe('southEast');
  });

  it("turns the second player's unit first, and holds the facing of one still engaged", () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'east');
    const blackWp = placed(blackUnit, 'E-5', 'west');
    const board = createGameStateWithUnits([whiteWp, blackWp]);

    const melee = createMeleeResolutionState(board, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithReverse(
        whiteWp.unit,
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithReverse(
        blackWp.unit,
      ),
    });
    const full = updatePhaseState(
      board,
      createResolveMeleePhaseState(board, {
        currentMeleeResolutionState: melee,
      }),
    );

    const event = generateResolveReverseEvent(full);
    expect(event.effectType).toBe('resolveReverse');
    // White holds initiative and strikes first, so black's unit is the second
    // player's and is the one that suffers first (§7.5.6).
    expect(event.unit).toBe(blackUnit);
    // Both units share E-5, so the black unit is engaged and holds the facing
    // it had (§7.5.5). The reverse still resolves; it just turns nobody.
    expect(event.facing).toBe('west');
  });

  it('turns a melee unit about once the enemy it fought has fallen back (§7.5.5)', () => {
    // White holds the initiative. White's blow drove black's unit back from
    // E-5 to D-5, and that retreat is done; black's blow reversed white's.
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const blackBefore = placed(blackUnit, 'E-5', 'south');
    const blackAfter = placed(blackUnit, 'D-5', 'south');
    const board = createGameStateWithUnits([whiteWp, blackAfter]);

    const blackRetreatDone = createRetreatState(
      blackUnit,
      legalRetreatsOf(blackBefore, [whiteWp]),
      { completed: true },
    );
    const melee = createMeleeResolutionState(board, {
      attackOnFirstPlayerApplyState:
        createAttackApplyStateWithReverse(whiteUnit),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        blackUnit,
        blackRetreatDone.legalRetreatPaths,
        { retreatState: blackRetreatDone },
      ),
    });
    const full = updatePhaseState(
      board,
      createResolveMeleePhaseState(board, {
        currentMeleeResolutionState: melee,
      }),
    );

    // White's unit stands alone on E-5 now, so the blow it took shows: it
    // turns about.
    expect(generateResolveReverseEvent(full)).toStrictEqual({
      effectType: 'resolveReverse',
      eventType: 'gameEffect',
      facing: 'south',
      unit: whiteUnit,
    });
  });

  it('throws outside a shot or a melee, where nothing reverses', () => {
    // Playing cards resolves no attack, so no reverse can be due.
    const full = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveReverseEvent(full)).toThrow(
      'Reverse resolution not expected in phase: playCards',
    );
  });
});
