import type { EngagementType, UnitWithPlacement } from '@entities';
import type { StartEngagementEvent } from '@events';
import type { GameState } from '@game';
import { throwIfNone, throwIfPending } from '@utils';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  placed,
} from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyStartEngagementEvent } from './applyStartEngagementEvent';

import { createEmptyGameState, createUnitPlacement } from '@factories';
/**
 * When a move enters an enemy hex, this seeds `engagementState` on the movement CRS from the
 * procedure’s `engagementType` (front vs rear rout vs flank rotation pipeline).
 */
describe('applyStartEngagementEvent function', () => {
  /**
   * Black E-5 moving into white on E-6 with north-facing target placement;
   * if the commander rides, black's commander stands with the mover.
   */
  function stateWithMovementToEnemy(options?: { commanderRides?: boolean }): {
    state: GameState;
    defenderWithPlacement: UnitWithPlacement;
  } {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const defendingUnit = createTestUnit('white');
    const blackMover = createTestUnit('black');
    const defenderWithPlacement = placed(defendingUnit, 'E-6', 'south');
    // The mover waits on its start space until the engagement places it.
    const moverWithPlacement = placed(blackMover, 'E-5', 'north');
    const units = addUnitToBoard(
      addUnitToBoard(state.boardState, defenderWithPlacement),
      moverWithPlacement,
    );
    const commanderRides = options?.commanderRides ?? false;
    const withBoard = {
      ...state,
      boardState: commanderRides
        ? addCommanderToBoard(units, 'black', 'E-5')
        : units,
    };
    const movement = createMovementResolutionState(withBoard, {
      moveCommander: commanderRides,
      movingUnit: moverWithPlacement,
      targetPlacement: createUnitPlacement('E-6', 'north'),
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    return {
      defenderWithPlacement,
      state: updatePhaseState(withBoard, phase),
    };
  }

  it('given event engagementType front, movement engagement is front and engager is movingUnit', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      defenderWithPlacement,
      effectType: 'startEngagement' as const,
      engagementType: 'front' as const,
      eventType: 'gameEffect' as const,
    };

    const next = applyStartEngagementEvent(event, state);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = throwIfPending(phase.currentCommandResolutionState, 'command');
    expect(cmd.commandResolutionType).toBe('movement');
    if (cmd.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(cmd.engagementState, 'engagement');
    expect(engagement.engagementResolutionState.engagementType).toBe('front');
    expect(engagement.engagingUnit).toBe(cmd.movingUnit.unit);
  });

  it('given event engagementType rear, rear routState player matches defender side with pending penalty', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      defenderWithPlacement,
      effectType: 'startEngagement' as const,
      engagementType: 'rear' as const,
      eventType: 'gameEffect' as const,
    };

    const next = applyStartEngagementEvent(event, state);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = throwIfPending(phase.currentCommandResolutionState, 'command');
    if (cmd.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(cmd.engagementState, 'engagement');
    const res = engagement.engagementResolutionState;
    expect(res.engagementType).toBe('rear');
    if (res.engagementType !== 'rear') {
      throw new Error('rear');
    }
    const rout = throwIfPending(res.routState, 'rout');
    expect(rout.player).toBe(defenderWithPlacement.unit.playerSide);
    expect(rout.numberToDiscard).toBe('pending');
  });

  it('a rear engagement steps the attacker into the space its routed defender left', () => {
    // §6.3.3: the defender routs off the board at once, and the attacker
    // stands where it stood before its owner is asked for the Morale.
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      defenderWithPlacement,
      effectType: 'startEngagement' as const,
      engagementType: 'rear' as const,
      eventType: 'gameEffect' as const,
    };

    const next = applyStartEngagementEvent(event, state);

    // The attacker has left its start space for the defender's.
    expect(next.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    const target = next.boardState.board['E-6']?.unitPresence;
    expect(target?.presenceType === 'single' && target.unit.playerSide).toBe(
      'black',
    );
    expect(target?.presenceType === 'single' && target.facing).toBe('north');
  });

  it("a commander riding into the defender's rear arrives with the attacker", () => {
    // §4.3.10: black's commander stands with the attacker on E-5 and rides.
    const { state, defenderWithPlacement } = stateWithMovementToEnemy({
      commanderRides: true,
    });

    // The rear engagement starts: the defender routs and the attacker takes
    // its space at once.
    const next = applyStartEngagementEvent(
      {
        defenderWithPlacement,
        effectType: 'startEngagement',
        engagementType: 'rear',
        eventType: 'gameEffect',
      },
      state,
    );

    // The commander is with the attacker in the space the defender left, and
    // the rout does not touch it: only the unit routed.
    expect(next.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(next.boardState.board['E-6']?.commanders).toStrictEqual(['black']);
  });

  it('given event engagementType flank, flank substep present and defenderRotated false', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      defenderWithPlacement,
      effectType: 'startEngagement' as const,
      engagementType: 'flank' as const,
      eventType: 'gameEffect' as const,
    };

    const next = applyStartEngagementEvent(event, state);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = throwIfPending(phase.currentCommandResolutionState, 'command');
    if (cmd.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(cmd.engagementState, 'engagement');
    const res = engagement.engagementResolutionState;
    expect(res.engagementType).toBe('flank');
    if (res.engagementType !== 'flank') {
      throw new Error('flank');
    }
    expect(res.defenderRotated).toBe(false);
  });

  it('given bogus engagementType siege cast, throws unknown engagement type', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      eventType: 'gameEffect' as const,
      effectType: 'startEngagement' as const,
      // Intentionally bad type cast to test error path
      engagementType: 'siege' as unknown as EngagementType,
      defenderWithPlacement,
    };

    expect(() => applyStartEngagementEvent(event, state)).toThrow(
      'Unknown engagement type: siege',
    );
  });
});
