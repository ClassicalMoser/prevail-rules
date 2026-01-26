import type {
  GameState,
  StandardBoard,
  UnitWithPlacement,
} from '@entities';
import type { ResolveReverseEvent } from '@events';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createReverseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyResolveReverseEvent } from './applyResolveReverseEvent';

describe('applyResolveReverseEvent', () => {
  /**
   * Helper to create a game state with a reverse state in ranged attack resolution
   */
  function createStateWithRangedAttackReverse(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const reversingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: reversingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const reverseState = createReverseState(unitWithPlacement);
    const attackApplyState = createAttackApplyState(reversingUnit, {
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: true,
      },
      reverseState,
    });
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /**
   * Helper to create a game state with a reverse state in melee resolution.
   * In melee, a unit can only be reversed if their opponent was first retreated or routed.
   * When reversing, the opponent has already retreated/routed and moved away,
   * so the reversing unit is alone at the coordinate.
   */
  function createStateWithMeleeReverse(
    reversingPlayer: 'white' | 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const reversingUnit = createTestUnit(reversingPlayer, { attack: 2 });
    const opponentPlayer = reversingPlayer === 'white' ? 'black' : 'white';
    const opponentUnit = createTestUnit(opponentPlayer, { attack: 2 });

    const reversingUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: reversingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    // Opponent was at E-5 but has already retreated/routed to a different coordinate
    const opponentUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: opponentUnit,
      placement: { coordinate: 'E-4', facing: 'south' }, // Moved away after retreat/rout
    };

    // Only the reversing unit is on the board (opponent has already retreated/routed)
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, reversingUnitWithPlacement),
    };

    // Opponent must have retreated or routed first for reverse to be possible
    const opponentRetreatState = createRetreatState(opponentUnitWithPlacement);
    const opponentAttackApplyState = createAttackApplyState(opponentUnit, {
      attackResult: {
        unitRouted: false,
        unitRetreated: true, // Opponent retreated
        unitReversed: false,
      },
      retreatState: opponentRetreatState,
    });

    // Reversing unit gets reversed
    const reverseState = createReverseState(reversingUnitWithPlacement);
    const reversingAttackApplyState = createAttackApplyState(reversingUnit, {
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: true,
      },
      reverseState,
    });

    const meleeState = createMeleeResolutionState(stateWithUnit, {
      ...(reversingPlayer === 'white'
        ? {
            whiteAttackApplyState: reversingAttackApplyState,
            blackAttackApplyState: opponentAttackApplyState,
          }
        : {
            blackAttackApplyState: reversingAttackApplyState,
            whiteAttackApplyState: opponentAttackApplyState,
          }),
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnit, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  describe('ranged attack resolution context', () => {
    it('should update unit facing on board', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        unitInstance: reverseState.reversingUnit,
        newUnitPlacement: newPlacement,
      };

      const newState = applyResolveReverseEvent(event, state);

      const boardSpace = newState.boardState.board['E-5'];
      expect(boardSpace?.unitPresence.presenceType).toBe('single');
      if (boardSpace?.unitPresence.presenceType === 'single') {
        expect(boardSpace.unitPresence.facing).toBe('south');
        expect(boardSpace.unitPresence.unit).toEqual(
          reverseState.reversingUnit.unit,
        );
      }
    });

    it('should mark reverse state as completed', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        unitInstance: reverseState.reversingUnit,
        newUnitPlacement: newPlacement,
      };

      const newState = applyResolveReverseEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);
      const newReverseState =
        getReverseStateFromAttackApply(newAttackApplyState);

      expect(newReverseState.completed).toBe(true);
      expect(newReverseState.finalPosition).toEqual(newPlacement.placement);
    });

    it('should preserve other board spaces', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      // Add another unit at a different location
      const otherUnit = createTestUnit('black', { attack: 2 });
      const stateWithOtherUnit = {
        ...state,
        boardState: addUnitToBoard(state.boardState, {
          unit: otherUnit,
          placement: { coordinate: 'D-5', facing: 'north' },
        }),
      };

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        unitInstance: reverseState.reversingUnit,
        newUnitPlacement: newPlacement,
      };

      const newState = applyResolveReverseEvent(event, stateWithOtherUnit);

      // Other unit should still be at D-5
      const otherSpace = newState.boardState.board['D-5'];
      expect(otherSpace?.unitPresence.presenceType).toBe('single');
      if (otherSpace?.unitPresence.presenceType === 'single') {
        expect(otherSpace.unitPresence.unit).toEqual(otherUnit);
      }
    });
  });

  describe('melee resolution context', () => {
    it('should update unit facing and mark reverse as completed for first player', () => {
      const state = createStateWithMeleeReverse('black');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'black');
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        unitInstance: reverseState.reversingUnit,
        newUnitPlacement: newPlacement,
      };

      const newState = applyResolveReverseEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromMelee(
        newState,
        'black',
      );
      const newReverseState =
        getReverseStateFromAttackApply(newAttackApplyState);

      expect(newReverseState.completed).toBe(true);
      expect(newReverseState.finalPosition).toEqual(newPlacement.placement);

      const boardSpace = newState.boardState.board['E-5'];
      expect(boardSpace?.unitPresence.presenceType).toBe('single');
    });

    it('should update unit facing and mark reverse as completed for second player', () => {
      const state = createStateWithMeleeReverse('white');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'white');
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'east' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        unitInstance: reverseState.reversingUnit,
        newUnitPlacement: newPlacement,
      };

      const newState = applyResolveReverseEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromMelee(
        newState,
        'white',
      );
      const newReverseState =
        getReverseStateFromAttackApply(newAttackApplyState);

      expect(newReverseState.completed).toBe(true);
      expect(newReverseState.finalPosition).toEqual(newPlacement.placement);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = getReverseStateFromAttackApply(attackApplyState);
      const originalCompleted = reverseState.completed;
      const originalBoardState = state.boardState;

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        unitInstance: reverseState.reversingUnit,
        newUnitPlacement: newPlacement,
      };

      applyResolveReverseEvent(event, state);

      expect(reverseState.completed).toBe(originalCompleted);
      expect(state.boardState).toBe(originalBoardState);
    });
  });
});
