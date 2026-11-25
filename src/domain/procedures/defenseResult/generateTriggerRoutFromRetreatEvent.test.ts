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
  createTestUnit,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateTriggerRoutFromRetreatEvent } from './generateTriggerRoutFromRetreatEvent';

// TODO(misleading): the event carries nothing, so no context or player is
// explicit on it; the apply asks the state which retreat is waiting for its
// rout. Settle by rewording the header.
/**
 * When the defender cannot retreat legally, the engine emits `triggerRoutFromRetreat` so the
 * rout flow can start instead. Context is ranged vs melee; in melee the retreating player is
 * explicit when both sides could theoretically be in retreat substeps.
 */
describe('generateTriggerRoutFromRetreatEvent function', () => {
  // White's unit on E-5 facing north, and the black archer that shot at it
  // from two spaces ahead.
  const target = placed(createTestUnit('white', { attack: 2 }), 'E-5', 'north');
  const shooter = placed(
    createTestUnit('black', { attack: 2 }),
    'C-5',
    'south',
  );

  it('names the effect for a ranged retreat with nowhere to go, and carries nothing', () => {
    // A black unit on F-5 facing the defender closes its way back, so it has no
    // retreat and must rout instead (§9.1.5, §9.1.6).
    const cutter = enemyCuttingOffRetreat(target);
    const board = createGameStateWithUnits([target, shooter, cutter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithRetreat(
        target.unit,
        legalRetreatsOf(target, [shooter, cutter]),
      ),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    const event = generateTriggerRoutFromRetreatEvent(state);

    // Which retreat it is, is the state's to say when the event is applied.
    expect(event).toStrictEqual({
      effectType: 'triggerRoutFromRetreat',
      eventType: 'gameEffect',
    });
  });

  it('names the same effect for a melee retreat with nowhere to go', () => {
    // White holds the initiative, so black's unit is the second player's and
    // falls back first (§7.5.6).
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
    // A third unit, an enemy of the retreating one, stands directly behind it
    // facing it, so the retreating unit cannot fall back (§9.1.5).
    const cutter = enemyCuttingOffRetreat(blackWp);
    const board = createGameStateWithUnits([whiteWp, blackWp, cutter]);

    // White's blow drove black's unit back; black's reached nothing.
    const melee = createMeleeResolutionState(board, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithNothingDue(
        whiteWp.unit,
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        blackWp.unit,
        legalRetreatsOf(blackWp, [whiteWp, cutter]),
      ),
    });
    const fighting = updatePhaseState(
      board,
      createResolveMeleePhaseState(board, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(generateTriggerRoutFromRetreatEvent(fighting)).toStrictEqual({
      effectType: 'triggerRoutFromRetreat',
      eventType: 'gameEffect',
    });
  });

  it('throws outside any combat, where no retreat can be waiting to rout', () => {
    // Playing cards resolves no attack, so nothing can be retreating.
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateTriggerRoutFromRetreatEvent(full)).toThrow(
      'Retreat rout not expected in phase: playCards',
    );
  });

  it('throws for a retreat that has somewhere to go', () => {
    // Open ground behind the target: it falls back and does not rout, so the
    // effect is not owed (§9.1.6 applies only when no retreat exists).
    const board = createGameStateWithUnits([target, shooter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithRetreat(
        target.unit,
        legalRetreatsOf(target, [shooter]),
      ),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    expect(() => generateTriggerRoutFromRetreatEvent(state)).toThrow(
      'No retreat with nowhere to go is waiting for its rout',
    );
  });
});
