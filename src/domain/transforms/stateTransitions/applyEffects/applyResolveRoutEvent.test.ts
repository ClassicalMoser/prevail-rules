import type {
  GameState,
  MovementResolutionState,
  StandardBoard,
  UnitWithPlacement,
} from '@entities';
import type { ResolveRoutEvent } from '@events';
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
import { describe, expect, it } from 'vitest';
import { applyResolveRoutEvent } from './applyResolveRoutEvent';

describe('applyResolveRoutEvent', () => {
  /**
   * Helper to create a game state with a rout state in ranged attack resolution
   */
  function createStateWithRangedAttackRout(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const routedUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: routedUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
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

  /**
   * Helper to create a game state with a rout state in melee resolution
   */
  function createStateWithMeleeRout(
    routingPlayer: 'white' | 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const routedUnit = createTestUnit(routingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      routingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );

    const routedUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: routedUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const otherUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: otherUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
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
    const meleeState = createMeleeResolutionState(stateWithUnits, {
      ...(routingPlayer === 'white'
        ? { whiteAttackApplyState: attackApplyState }
        : { blackAttackApplyState: attackApplyState }),
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  function createStateWithRearEngagementRoutAwaitingPenalty(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const defender = createTestUnit('white', { attack: 2 });
    const attacker = createTestUnit('black', { attack: 2 });
    const movement = createMovementResolutionState(state, {
      movingUnit: {
        unit: attacker,
        placement: { coordinate: 'E-4', facing: 'south' },
      },
      targetPlacement: { coordinate: 'E-5', facing: 'south' },
      engagementState: {
        substepType: 'engagementResolution',
        engagingUnit: attacker,
        targetPlacement: { coordinate: 'E-5', facing: 'south' },
        engagementResolutionState: {
          engagementType: 'rear',
          routState: {
            substepType: 'rout',
            player: 'white',
            unitsToRout: new Set([defender]),
            numberToDiscard: undefined,
            cardsChosen: false,
            completed: false,
          },
          completed: false,
        },
        completed: false,
      },
    });
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: movement,
    });
    return updatePhaseState(state, phaseState);
  }

  describe('ranged attack resolution context', () => {
    it('should set numberToDiscard on rout state', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'rangedAttack',
        unitInstances: new Set([routState.unitsToRout.values().next().value!]),
        penalty: 2,
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);
      const newRoutState = newAttackApplyState.routState!;

      expect(newRoutState.numberToDiscard).toBe(2);
    });

    it('should preserve other rout state properties', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'rangedAttack',
        unitInstances: new Set([routState.unitsToRout.values().next().value!]),
        penalty: 3,
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);
      const newRoutState = newAttackApplyState.routState!;

      expect(newRoutState.substepType).toBe('rout');
      expect(newRoutState.player).toBe(routState.player);
      expect(newRoutState.unitsToRout).toEqual(routState.unitsToRout);
      expect(newRoutState.cardsChosen).toBe(false);
      expect(newRoutState.completed).toBe(false);
    });
  });

  describe('melee resolution context', () => {
    it('should set numberToDiscard for first player', () => {
      const state = createStateWithMeleeRout('black');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'black');
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'melee',
        unitInstances: new Set([routState.unitsToRout.values().next().value!]),
        penalty: 2,
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromMelee(
        newState,
        'black',
      );
      const newRoutState = newAttackApplyState.routState!;

      expect(newRoutState.numberToDiscard).toBe(2);
    });

    it('should set numberToDiscard for second player', () => {
      const state = createStateWithMeleeRout('white');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'white');
      const routState = attackApplyState.routState!;

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'melee',
        unitInstances: new Set([routState.unitsToRout.values().next().value!]),
        penalty: 1,
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

  describe('rally resolution context', () => {
    it('should set numberToDiscard on rout state in rally', () => {
      const state = createEmptyGameState();
      const routedUnit = createTestUnit('white', { attack: 2 });
      const routState = createRoutState('white', routedUnit);

      const rallyState = createRallyResolutionState({
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: new Set(),
        routState,
      });

      const phaseState = createCleanupPhaseState({
        step: 'firstPlayerResolveRally',
        firstPlayerRallyResolutionState: rallyState,
      });

      const stateWithRally = updatePhaseState(state, phaseState);

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'rally',
        unitInstances: new Set([routedUnit]),
        penalty: 2,
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

  describe('rear engagement movement context', () => {
    it('should set numberToDiscard on rout state nested in movement engagement', () => {
      const state = createStateWithRearEngagementRoutAwaitingPenalty();
      const movement = getIssueCommandsPhaseState(state)
        .currentCommandResolutionState as MovementResolutionState<StandardBoard>;
      const resolution = movement.engagementState!.engagementResolutionState;
      if (resolution.engagementType !== 'rear') {
        throw new Error('expected rear');
      }
      const rout = resolution.routState!;

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'rearEngagementMovement',
        unitInstances: rout.unitsToRout,
        penalty: [...rout.unitsToRout].reduce(
          (sum, u) => sum + u.unitType.routPenalty,
          0,
        ),
      };

      const newState = applyResolveRoutEvent(event, state);
      const newMovement = getIssueCommandsPhaseState(newState)
        .currentCommandResolutionState as MovementResolutionState<StandardBoard>;
      const newResolution =
        newMovement.engagementState!.engagementResolutionState;
      if (newResolution.engagementType !== 'rear') {
        throw new Error('expected rear');
      }
      expect(newResolution.routState?.numberToDiscard).toBe(event.penalty);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const routState = attackApplyState.routState!;
      const originalNumberToDiscard = routState.numberToDiscard;

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'rangedAttack',
        unitInstances: new Set([routState.unitsToRout.values().next().value!]),
        penalty: 2,
      };

      applyResolveRoutEvent(event, state);

      expect(routState.numberToDiscard).toBe(originalNumberToDiscard);
    });
  });

  describe('error cases', () => {
    it('should throw if no units to rout', () => {
      const state = createStateWithMeleeRout('black');

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'melee',
        unitInstances: new Set(),
        penalty: 2,
      };

      expect(() => applyResolveRoutEvent(event, state)).toThrow(
        'Melee rout resolution requires at least one unit instance',
      );
    });

    it('should throw if no rout state found', () => {
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

      const event: ResolveRoutEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRout',
        routResolutionSource: 'rangedAttack',
        unitInstances: new Set([unit]),
        penalty: 2,
      };

      expect(() => applyResolveRoutEvent(event, stateWithoutRout)).toThrow(
        'No rout state found in attack apply state',
      );
    });
  });
});
