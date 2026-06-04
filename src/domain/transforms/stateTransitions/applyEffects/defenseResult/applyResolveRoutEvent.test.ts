import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { ResolveRoutEvent } from '@events';
import type { GameStateForBoard, MovementResolutionState } from '@game';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getIssueCommandsPhaseState,
  getRoutStateFromRally,
} from '@queries';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyResolveRoutEvent } from './applyResolveRoutEvent';

/**
 * Writes `numberToDiscard` (and related rout bookkeeping) onto the active rout substep for
 * the matching source: ranged/melee apply, cleanup rally, or rear engagement under movement.
 */
describe(applyResolveRoutEvent, () => {
  /** IssueCommands + ranged apply with rout substep on white at E-5. */
  function createStateWithRangedAttackRout(): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState();
    const routedUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: routedUnit,
    };

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState = createAttackApplyStateWithRout(routedUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /** ResolveMelee + rout substep on the named player’s attack apply. */
  function createStateWithMeleeRout(
    routingPlayer: 'white' | 'black',
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const routedUnit = createTestUnit(routingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      routingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );

    const routedUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: routedUnit,
    };
    const otherUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: otherUnit,
    };

    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, routedUnitWithPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(
        stateWithUnits.boardState,
        otherUnitWithPlacement,
      ),
    };

    const attackApplyState = createAttackApplyStateWithRout(routedUnit);
    const meleeState = createMeleeResolutionState(
      stateWithUnits,
      routingPlayer === 'white'
        ? { whiteAttackApplyState: attackApplyState }
        : { blackAttackApplyState: attackApplyState },
    );
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  function createStateWithRearEngagementRoutAwaitingPenalty(): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState();
    const defender = createTestUnit('white', { attack: 2 });
    const attacker = createTestUnit('black', { attack: 2 });
    const movement = createMovementResolutionState(state, {
      engagementState: {
        boardType: 'standard' as const,
        completed: false,
        engagementResolutionState: {
          completed: false,
          engagementType: 'rear',
          routState: {
            cardsChosen: false,
            completed: false,
            numberToDiscard: undefined,
            player: 'white',
            substepType: 'rout',
            unitsToRout: [defender],
          },
        },
        engagingUnit: attacker,
        substepType: 'engagementResolution',
        targetPlacement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'south',
        },
      },
      movingUnit: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-4',
          facing: 'south',
        },
        unit: attacker,
      },
      targetPlacement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
    });
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: movement,
    });
    return updatePhaseState(state, phaseState);
  }

  describe('ranged rout substep', () => {
    it('given ranged rout and event penalty 2, nested routState.numberToDiscard is 2', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'rangedAttack',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);
      const newRoutState = newAttackApplyState.routState!;

      expect(newRoutState.numberToDiscard).toBe(2);
    });

    it('given penalty 3, player unitsToRout and cardsChosen unchanged besides numberToDiscard', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 3,
        routResolutionSource: 'rangedAttack',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);
      const newRoutState = newAttackApplyState.routState!;

      expect(newRoutState.substepType).toBe('rout');
      expect(newRoutState.player).toBe(routState.player);
      expect(newRoutState.unitsToRout).toStrictEqual(routState.unitsToRout);
      expect(newRoutState.cardsChosen).toBeFalsy();
      expect(newRoutState.completed).toBeFalsy();
    });
  });

  describe('melee rout substep', () => {
    it('given black melee rout, event penalty 2 updates black apply rout numberToDiscard', () => {
      const state = createStateWithMeleeRout('black');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'black');
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'melee',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromMelee(
        newState,
        'black',
      );
      const newRoutState = newAttackApplyState.routState!;

      expect(newRoutState.numberToDiscard).toBe(2);
    });

    it('given white melee rout, event penalty 1 updates white apply rout numberToDiscard', () => {
      const state = createStateWithMeleeRout('white');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'white');
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 1,
        routResolutionSource: 'melee',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromMelee(
        newState,
        'white',
      );
      const newRoutState = newAttackApplyState.routState!;

      expect(newRoutState.numberToDiscard).toBe(1);
    });
  });

  describe('cleanup rally rout', () => {
    it('given firstPlayerResolveRally with routState, event penalty 2 lands on rally rout', () => {
      const state = createEmptyGameState();
      const routedUnit = createTestUnit('white', { attack: 2 });
      const routState = createRoutState('white', routedUnit);

      const rallyState = createRallyResolutionState({
        playerRallied: true,
        rallyResolved: false,
        routState,
        unitsLostSupport: [],
      });

      const phaseState = createCleanupPhaseState({
        firstPlayerRallyResolutionState: rallyState,
        step: 'firstPlayerResolveRally',
      });

      const stateWithRally = updatePhaseState(state, phaseState);

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'rally',
        unitInstances: [routedUnit],
      };

      const newState = applyResolveRoutEvent(event, stateWithRally);
      const newPhaseState = newState.currentRoundState.currentPhaseState;
      if (!newPhaseState || newPhaseState.phase !== 'cleanup') {
        throw new Error('Expected cleanup phase');
      }
      const newRallyState = newPhaseState.firstPlayerRallyResolutionState!;
      const newRoutState = getRoutStateFromRally(newRallyState);

      expect(newRoutState.numberToDiscard).toBe(2);
    });
  });

  describe('rear engagement movement', () => {
    it('given rear engagement rout under movement CRS, event penalty matches summed unit penalties', () => {
      const state = createStateWithRearEngagementRoutAwaitingPenalty();
      const movement = getIssueCommandsPhaseState(state)
        .currentCommandResolutionState as MovementResolutionState;
      const resolution = movement.engagementState!.engagementResolutionState;
      if (resolution.engagementType !== 'rear') {
        throw new Error('expected rear');
      }
      const rout = resolution.routState!;

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: rout.unitsToRout.reduce(
          (sum, u) => sum + u.unitType.routPenalty,
          0,
        ),
        routResolutionSource: 'rearEngagementMovement',
        unitInstances: rout.unitsToRout,
      };

      const newState = applyResolveRoutEvent(event, state);
      const newMovement = getIssueCommandsPhaseState(newState)
        .currentCommandResolutionState as MovementResolutionState;
      const newResolution =
        newMovement.engagementState!.engagementResolutionState;
      if (newResolution.engagementType !== 'rear') {
        throw new Error('expected rear');
      }
      expect(newResolution.routState?.numberToDiscard).toBe(event.penalty);
    });
  });

  describe('structural update', () => {
    it('given original rout numberToDiscard undefined, input rout object unchanged after apply', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const routState = attackApplyState.routState!;
      const originalNumberToDiscard = routState.numberToDiscard;

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'rangedAttack',
        unitInstances: [routState.unitsToRout[0]],
      };

      applyResolveRoutEvent(event, state);

      expect(routState.numberToDiscard).toBe(originalNumberToDiscard);
    });
  });

  describe('errors', () => {
    it('given melee rout event with empty unitInstances, throws melee rout requires unit', () => {
      const state = createStateWithMeleeRout('black');

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'melee',
        unitInstances: [],
      };

      expect(() => applyResolveRoutEvent(event, state)).toThrow(
        'Melee rout resolution requires at least one unit instance',
      );
    });

    it('given ranged apply without rout substep, throws no rout state in attack apply', () => {
      const state = createEmptyGameState();
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit, {
        routState: undefined,
      });
      const rangedAttackState = createRangedAttackResolutionState(state, {
        attackApplyState,
      });
      const phaseState = createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: rangedAttackState,
      });
      const stateWithoutRout = updatePhaseState(state, phaseState);

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'rangedAttack',
        unitInstances: [unit],
      };

      expect(() => applyResolveRoutEvent(event, stateWithoutRout)).toThrow(
        'No rout state found in attack apply state',
      );
    });
  });
});
