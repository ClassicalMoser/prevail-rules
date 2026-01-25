import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import type { ResolveRetreatEvent } from '@events';
import {
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyResolveRetreatEvent } from './applyResolveRetreatEvent';

describe('applyResolveRetreatEvent', () => {
  /**
   * Helper to create a game state with a retreat state in ranged attack resolution
   */
  function createStateWithRangedAttackRetreat(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };

    // Add unit to board
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    // Create attack apply state with retreat
    const attackApplyState =
      createAttackApplyStateWithRetreat(unitWithPlacement);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /**
   * Helper to create a game state with a retreat state in melee resolution
   */
  function createStateWithMeleeRetreat(
    retreatingPlayer: 'white' | 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );

    const retreatingUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const otherUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: otherUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };

    // Add both units to board (engaged)
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, retreatingUnitWithPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(
        stateWithUnits.boardState,
        otherUnitWithPlacement,
      ),
    };

    // Create attack apply state with retreat for the retreating player
    const attackApplyState = createAttackApplyStateWithRetreat(
      retreatingUnitWithPlacement,
    );
    const meleeState = createMeleeResolutionState(stateWithUnits, {
      ...(retreatingPlayer === 'white'
        ? { whiteAttackApplyState: attackApplyState }
        : { blackAttackApplyState: attackApplyState }),
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe('ranged attack resolution context', () => {
    it('should move unit from starting position to final position', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRetreat',
        startingPosition: retreatState.retreatingUnit,
        finalPosition: {
          unit: retreatState.retreatingUnit.unit,
          placement: { coordinate: 'E-4', facing: 'north' },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);

      // Unit should be removed from starting position
      const startingSpace = newState.boardState.board['E-5'];
      expect(startingSpace?.unitPresence.presenceType).toBe('none');

      // Unit should be added to final position
      const finalSpace = newState.boardState.board['E-4'];
      expect(finalSpace?.unitPresence.presenceType).toBe('single');
      if (finalSpace?.unitPresence.presenceType === 'single') {
        expect(finalSpace.unitPresence.unit).toEqual(
          retreatState.retreatingUnit.unit,
        );
        expect(finalSpace.unitPresence.facing).toBe('north');
      }
    });

    it('should mark retreat state as completed', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRetreat',
        startingPosition: retreatState.retreatingUnit,
        finalPosition: {
          unit: retreatState.retreatingUnit.unit,
          placement: { coordinate: 'E-4', facing: 'north' },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromRangedAttack(newState);

      expect(newRetreatState.completed).toBe(true);
    });

    it('should preserve other board spaces', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      // Add another unit at a different location
      const otherUnit = createTestUnit('black', { attack: 2 });
      const stateWithOtherUnit = {
        ...state,
        boardState: addUnitToBoard(state.boardState, {
          unit: otherUnit,
          placement: { coordinate: 'D-5', facing: 'north' },
        }),
      };

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRetreat',
        startingPosition: retreatState.retreatingUnit,
        finalPosition: {
          unit: retreatState.retreatingUnit.unit,
          placement: { coordinate: 'E-4', facing: 'north' },
        },
      };

      const newState = applyResolveRetreatEvent(event, stateWithOtherUnit);

      // Other unit should still be at D-5
      const otherSpace = newState.boardState.board['D-5'];
      expect(otherSpace?.unitPresence.presenceType).toBe('single');
      if (otherSpace?.unitPresence.presenceType === 'single') {
        expect(otherSpace.unitPresence.unit).toEqual(otherUnit);
      }
    });
  });

  describe('melee resolution context', () => {
    it('should move unit and mark retreat as completed for first player', () => {
      const state = createStateWithMeleeRetreat('black');
      const retreatState = getRetreatStateFromMelee(state, 'black');

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRetreat',
        startingPosition: retreatState.retreatingUnit,
        finalPosition: {
          unit: retreatState.retreatingUnit.unit,
          placement: { coordinate: 'E-4', facing: 'north' },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'black');

      expect(newRetreatState.completed).toBe(true);
      expect(newState.boardState.board['E-5']?.unitPresence.presenceType).toBe(
        'single',
      );
      expect(newState.boardState.board['E-4']?.unitPresence.presenceType).toBe(
        'single',
      );
    });

    it('should move unit and mark retreat as completed for second player', () => {
      const state = createStateWithMeleeRetreat('white');
      const retreatState = getRetreatStateFromMelee(state, 'white');

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRetreat',
        startingPosition: retreatState.retreatingUnit,
        finalPosition: {
          unit: retreatState.retreatingUnit.unit,
          placement: { coordinate: 'E-6', facing: 'south' },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'white');

      expect(newRetreatState.completed).toBe(true);
      expect(newState.boardState.board['E-5']?.unitPresence.presenceType).toBe(
        'single',
      );
      expect(newState.boardState.board['E-6']?.unitPresence.presenceType).toBe(
        'single',
      );
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);
      const originalCompleted = retreatState.completed;
      const originalBoardState = state.boardState;

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveRetreat',
        startingPosition: retreatState.retreatingUnit,
        finalPosition: {
          unit: retreatState.retreatingUnit.unit,
          placement: { coordinate: 'E-4', facing: 'north' },
        },
      };

      applyResolveRetreatEvent(event, state);

      expect(retreatState.completed).toBe(originalCompleted);
      expect(state.boardState).toBe(originalBoardState);
    });
  });
});
