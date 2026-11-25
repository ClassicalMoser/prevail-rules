import type { AttackResult } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateOpenRoutFromAttackApplyEvent } from './generateOpenRoutFromAttackApplyEvent';

// TODO(misleading): "in melee the defending player is named" no longer holds;
// the event carries nothing, and the apply asks the state which unit's rout
// opens. Settle by rewording the header.
/**
 * An attack that routed leaves the rout slot pending until this opener runs.
 * Context is ranged vs melee; in melee the defending player is named.
 */
describe('generateOpenRoutFromAttackApplyEvent function', () => {
  // A blow that reached Rout and nothing lower, so the rout is the one
  // result left to open.
  const routOnly: AttackResult = {
    unitRetreated: false,
    unitReversed: false,
    unitRouted: true,
  };

  it("names the effect for a shot's rout waiting to open, and carries nothing", () => {
    // White's unit on E-5, shot by the black archer two spaces ahead of it.
    const target = placed(
      createTestUnit('white', { attack: 2 }),
      'E-5',
      'north',
    );
    const shooter = placed(
      createTestUnit('black', { attack: 2 }),
      'C-5',
      'south',
    );
    const board = createGameStateWithUnits([target, shooter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyState(target.unit, routOnly),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    const event = generateOpenRoutFromAttackApplyEvent(state);
    // Which apply it opens on is the state's to name, not the event's.
    expect(event).toStrictEqual({
      effectType: 'openRoutFromAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('names the effect for a melee rout waiting to open, and carries nothing', () => {
    // White holds the initiative, as a new game starts, so black's unit is
    // the second player's, whose unit suffers first (§7.5.6).
    const white = placed(
      createTestUnit('white', { attack: 2 }),
      'E-5',
      'north',
    );
    const black = placed(
      createTestUnit('black', { attack: 2 }),
      'E-5',
      'south',
    );
    const board = createGameStateWithUnits([white, black]);

    // The defender's apply is the second player's, and it resolves first.
    // Black's blow reached none of white's thresholds.
    const melee = createMeleeResolutionState(board, {
      attackOnFirstPlayerApplyState: createAttackApplyState(white.unit, {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: false,
      }),
      attackOnSecondPlayerApplyState: createAttackApplyState(
        black.unit,
        routOnly,
      ),
    });
    const fighting = updatePhaseState(
      board,
      createResolveMeleePhaseState(board, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(generateOpenRoutFromAttackApplyEvent(fighting)).toStrictEqual({
      effectType: 'openRoutFromAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('throws when the phase is not holding an attack apply', () => {
    // Playing cards resolves no attack, so no rout can be waiting to open.
    const full = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateOpenRoutFromAttackApplyEvent(full)).toThrow(
      'Attack-apply rout open not expected in phase: playCards',
    );
  });
});
