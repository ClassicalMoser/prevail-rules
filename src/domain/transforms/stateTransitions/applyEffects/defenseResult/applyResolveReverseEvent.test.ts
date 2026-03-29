import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { ResolveReverseEvent } from '@events';
import type { GameState } from '@game';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyResolveReverseEvent } from './applyResolveReverseEvent';

/**
 * Defender’s counterattack facing: updates board placement to `newUnitPlacement` and closes the
 * reverse substep (`completed`, `finalPosition`) for ranged or the correct melee apply side.
 */
describe('applyResolveReverseEvent', () => {
  /** issueCommands + ranged apply in reverse substep for white on E-5. */
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

    const attackApplyState =
      createAttackApplyStateWithReverse(unitWithPlacement);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /**
   * Melee reverse: reversing side on E-5 alone; opponent already “gone” with retreat apply at E-4
   * so engagement geometry matches post-retreat resolution.
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

    const opponentAttackApplyState = createAttackApplyStateWithRetreat(
      opponentUnitWithPlacement,
    );
    const reversingAttackApplyState = createAttackApplyStateWithReverse(
      reversingUnitWithPlacement,
    );

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

  describe('ranged reverse substep', () => {
    it('given event south facing on E-5, board single presence faces south for reversing unit', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        attackResolutionContext: 'rangedAttack',
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

    it('given same event, reverse substep completed and finalPosition matches placement', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        attackResolutionContext: 'rangedAttack',
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

    it('given black observer on D-5, reverse apply leaves D-5 untouched', () => {
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
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        attackResolutionContext: 'rangedAttack',
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

  describe('melee reverse substep', () => {
    it('given black reverses south on E-5, black apply reverse completed and board updated', () => {
      const state = createStateWithMeleeReverse('black');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'black');
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'south' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        attackResolutionContext: 'melee',
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

    it('given white reverses east on E-5, white reverse completed and finalPosition east', () => {
      const state = createStateWithMeleeReverse('white');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'white');
      const reverseState = getReverseStateFromAttackApply(attackApplyState);

      const newPlacement: UnitWithPlacement<StandardBoard> = {
        unit: reverseState.reversingUnit.unit,
        placement: { coordinate: 'E-5', facing: 'east' },
      };

      const event: ResolveReverseEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        attackResolutionContext: 'melee',
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

  describe('structural update', () => {
    it('given reverse completed and board ref before apply, input slice unchanged after apply', () => {
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
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'resolveReverse',
        attackResolutionContext: 'rangedAttack',
        unitInstance: reverseState.reversingUnit,
        newUnitPlacement: newPlacement,
      };

      applyResolveReverseEvent(event, state);

      expect(reverseState.completed).toBe(originalCompleted);
      expect(state.boardState).toBe(originalBoardState);
    });
  });
});
