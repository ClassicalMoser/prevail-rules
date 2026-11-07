import type { ResolveRoutEvent } from '@events';
import type { GameState } from '@game';
import {
  getMeleeAttackApplyState,
  getRangedAttackApplyState,
  getIssueCommandsPhaseState,
  getRoutStateFromAttackApply,
  getRoutStateFromRally,
} from '@queries';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { throwIfBypassed, throwIfNone, throwIfPending } from '@utils';

import { applyResolveRoutEvent } from './applyResolveRoutEvent';

import { createEmptyGameState, createUnitPlacement } from '@factories';
/**
 * Writes `numberToDiscard` (and related rout bookkeeping) onto the active rout substep for
 * the matching source: ranged/melee apply, cleanup rally, or rear engagement under movement.
 */
describe('applyResolveRoutEvent function', () => {
  /** IssueCommands + ranged apply with rout substep on white at E-5. */
  function createStateWithRangedAttackRout(): GameState {
    const state = createEmptyGameState('standard');
    const routedUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(routedUnit, 'E-5', 'north');

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
  ): GameState {
    const state = createEmptyGameState('standard');
    const routedUnit = createTestUnit(routingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      routingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );

    const routedUnitWithPlacement = placed(routedUnit, 'E-5', 'north');
    const otherUnitWithPlacement = placed(otherUnit, 'E-5', 'south');

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

  function createStateWithRearEngagementRoutAwaitingPenalty(): GameState {
    const state = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const attacker = createTestUnit('black', { attack: 2 });
    const movement = createMovementResolutionState(state, {
      engagementState: {
        completed: false,
        engagementResolutionState: {
          completed: false,
          engagementType: 'rear',
          routState: {
            cardsChosen: false,
            completed: false,
            numberToDiscard: 'pending',
            player: 'white',
            substepType: 'rout',
            unitsToRout: [defender],
          },
        },
        engagingUnit: attacker,
        substepType: 'engagementResolution',
        targetPlacement: createUnitPlacement('E-5', 'south'),
      },
      movingUnit: placed(attacker, 'E-4', 'south'),
      targetPlacement: createUnitPlacement('E-5', 'south'),
    });
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: movement,
    });
    return updatePhaseState(state, phaseState);
  }

  describe('ranged rout substep', () => {
    it('given ranged rout and event penalty 2, nested routState.numberToDiscard is 2', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getRangedAttackApplyState(state);
      const routState = throwIfBypassed(
        getRoutStateFromAttackApply(attackApplyState),
        'the attack applies a rout',
      );

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'rangedAttack',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getRangedAttackApplyState(newState);
      const newRoutState = throwIfBypassed(
        getRoutStateFromAttackApply(newAttackApplyState),
        'the attack applies a rout',
      );

      expect(newRoutState.numberToDiscard).toBe(2);
    });

    it('a zero penalty closes the rout — there is nothing to choose', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getRangedAttackApplyState(state);
      const routState = throwIfBypassed(
        getRoutStateFromAttackApply(attackApplyState),
        'the attack applies a rout',
      );

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 0,
        routResolutionSource: 'rangedAttack',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getRangedAttackApplyState(newState);
      const newRoutState = throwIfBypassed(
        getRoutStateFromAttackApply(newAttackApplyState),
        'the attack applies a rout',
      );

      expect(newRoutState.numberToDiscard).toBe(0);
      expect(newRoutState.cardsChosen).toBe(true);
      expect(newRoutState.completed).toBe(true);
    });

    it('given penalty 3, player unitsToRout and cardsChosen unchanged besides numberToDiscard', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getRangedAttackApplyState(state);
      const routState = throwIfBypassed(
        getRoutStateFromAttackApply(attackApplyState),
        'the attack applies a rout',
      );

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 3,
        routResolutionSource: 'rangedAttack',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getRangedAttackApplyState(newState);
      const newRoutState = throwIfBypassed(
        getRoutStateFromAttackApply(newAttackApplyState),
        'the attack applies a rout',
      );

      expect(newRoutState.substepType).toBe('rout');
      expect(newRoutState.player).toBe(routState.player);
      expect(newRoutState.unitsToRout).toStrictEqual(routState.unitsToRout);
      expect(newRoutState.cardsChosen).toBe(false);
      expect(newRoutState.completed).toBe(false);
    });
  });

  describe('melee rout substep', () => {
    it('given black melee rout, event penalty 2 updates black apply rout numberToDiscard', () => {
      const state = createStateWithMeleeRout('black');
      const attackApplyState = getMeleeAttackApplyState(state, 'black');
      const routState = throwIfBypassed(
        getRoutStateFromAttackApply(attackApplyState),
        'the attack applies a rout',
      );

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 2,
        routResolutionSource: 'melee',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getMeleeAttackApplyState(newState, 'black');
      const newRoutState = throwIfBypassed(
        getRoutStateFromAttackApply(newAttackApplyState),
        'the attack applies a rout',
      );

      expect(newRoutState.numberToDiscard).toBe(2);
    });

    it('given white melee rout, event penalty 1 updates white apply rout numberToDiscard', () => {
      const state = createStateWithMeleeRout('white');
      const attackApplyState = getMeleeAttackApplyState(state, 'white');
      const routState = throwIfBypassed(
        getRoutStateFromAttackApply(attackApplyState),
        'the attack applies a rout',
      );

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: 1,
        routResolutionSource: 'melee',
        unitInstances: [routState.unitsToRout[0]],
      };

      const newState = applyResolveRoutEvent(event, state);
      const newAttackApplyState = getMeleeAttackApplyState(newState, 'white');
      const newRoutState = throwIfBypassed(
        getRoutStateFromAttackApply(newAttackApplyState),
        'the attack applies a rout',
      );

      expect(newRoutState.numberToDiscard).toBe(1);
    });
  });

  describe('cleanup rally rout', () => {
    it('given firstPlayerResolveRally with routState, event penalty 2 lands on rally rout', () => {
      const state = createEmptyGameState('standard');
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
      const newPhaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (newPhaseState.phase !== 'cleanup') {
        throw new Error('Expected cleanup phase');
      }
      const newRallyState = throwIfPending(
        newPhaseState.firstPlayerRallyResolutionState,
        'rally',
      );
      const newRoutState = getRoutStateFromRally(newRallyState);

      expect(newRoutState.numberToDiscard).toBe(2);
    });
  });

  describe('rear engagement movement', () => {
    it('given rear engagement rout under movement CRS, event penalty matches summed unit penalties', () => {
      const state = createStateWithRearEngagementRoutAwaitingPenalty();
      const movement = getIssueCommandsPhaseState(state);
      const commandState = throwIfPending(
        movement.currentCommandResolutionState,
        'command',
      );
      if (commandState.commandResolutionType !== 'movement') {
        throw new Error('movement');
      }
      const engagement = throwIfPending(
        commandState.engagementState,
        'engagement',
      );
      const resolution = throwIfPending(
        engagement.engagementResolutionState,
        'resolution',
      );
      if (resolution.engagementType !== 'rear') {
        throw new Error('expected rear');
      }
      const rout = throwIfPending(resolution.routState, 'rout');

      const event: ResolveRoutEvent = {
        effectType: 'resolveRout',
        eventNumber: 0,
        eventType: 'gameEffect',
        penalty: rout.unitsToRout.reduce(
          (sum: number, u) => sum + u.unitType.morale,
          0,
        ),
        routResolutionSource: 'rearEngagementMovement',
        unitInstances: rout.unitsToRout,
      };

      const newState = applyResolveRoutEvent(event, state);
      const newMovement = getIssueCommandsPhaseState(newState);
      const newCommandState = throwIfPending(
        newMovement.currentCommandResolutionState,
        'command',
      );
      if (newCommandState.commandResolutionType !== 'movement') {
        throw new Error('movement');
      }
      const newEngagement = throwIfPending(
        newCommandState.engagementState,
        'engagement',
      );
      const newResolution = throwIfPending(
        newEngagement.engagementResolutionState,
        'resolution',
      );
      if (newResolution.engagementType !== 'rear') {
        throw new Error('expected rear');
      }
      expect(
        throwIfPending(newResolution.routState, 'rout').numberToDiscard,
      ).toBe(event.penalty);
    });
  });

  describe('structural update', () => {
    it('given original rout numberToDiscard undefined, input rout object unchanged after apply', () => {
      const state = createStateWithRangedAttackRout();
      const attackApplyState = getRangedAttackApplyState(state);
      const routState = throwIfBypassed(
        getRoutStateFromAttackApply(attackApplyState),
        'the attack applies a rout',
      );
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

    it('throws when the ranged apply owes a rout that was never opened', () => {
      const state = createEmptyGameState('standard');
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit, {
        routState: 'pending',
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
        'The rout on this attack apply has not been opened yet',
      );
    });
  });
});
