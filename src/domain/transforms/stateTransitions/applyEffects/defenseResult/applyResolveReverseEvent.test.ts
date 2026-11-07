import { throwIfBypassed } from '@utils';
import type { ResolveReverseEvent } from '@events';
import type { GameState } from '@game';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getPositionOfUnit,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyResolveReverseEvent } from './applyResolveReverseEvent';

import { createEmptyGameState } from '@factories';
/**
 * Defender’s counterattack facing: updates board placement to `newUnitPlacement` and closes the
 * reverse substep (`completed`, `finalPosition`) for ranged or the correct melee apply side.
 */
describe('applyResolveReverseEvent function', () => {
  /** IssueCommands + ranged apply in reverse substep for white on E-5. */
  function createStateWithRangedAttackReverse(): GameState {
    const state = createEmptyGameState('standard');
    const reversingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(reversingUnit, 'E-5', 'north');

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState = createAttackApplyStateWithReverse(reversingUnit);
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
  ): GameState {
    const state = createEmptyGameState('standard');
    const reversingUnit = createTestUnit(reversingPlayer, { attack: 2 });
    const opponentPlayer = reversingPlayer === 'white' ? 'black' : 'white';
    const opponentUnit = createTestUnit(opponentPlayer, { attack: 2 });

    const reversingUnitWithPlacement = placed(reversingUnit, 'E-5', 'north');
    // Opponent was at E-5 but has already retreated/routed to a different coordinate
    const opponentUnitWithPlacement = placed(
      opponentUnit, // Moved away after retreat/rout
      'E-4',
      'south',
    );

    // Only the reversing unit is on the board (opponent has already retreated/routed)
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, reversingUnitWithPlacement),
    };

    const opponentAttackApplyState = createAttackApplyStateWithRetreat(
      opponentUnitWithPlacement,
    );
    const reversingAttackApplyState =
      createAttackApplyStateWithReverse(reversingUnit);

    const meleeState = createMeleeResolutionState(
      stateWithUnit,
      reversingPlayer === 'white'
        ? {
            blackAttackApplyState: opponentAttackApplyState,
            whiteAttackApplyState: reversingAttackApplyState,
          }
        : {
            blackAttackApplyState: reversingAttackApplyState,
            whiteAttackApplyState: opponentAttackApplyState,
          },
    );
    const phaseState = createResolveMeleePhaseState(stateWithUnit, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  describe('ranged reverse substep', () => {
    it('given event south facing on E-5, board single presence faces south for reversing unit', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = throwIfBypassed(
        getReverseStateFromAttackApply(attackApplyState),
        'the attack applies a reverse',
      );

      const newPlacement = placed(reverseState.reversingUnit, 'E-5', 'south');

      const event: ResolveReverseEvent = {
        attackResolutionContext: 'rangedAttack',
        effectType: 'resolveReverse',
        eventNumber: 0,
        eventType: 'gameEffect',
        newUnitPlacement: newPlacement,
        // The event records where the unit stood when it turned, which the
        // substep no longer carries.
        unitInstance: {
          placement: getPositionOfUnit(
            state.boardState,
            reverseState.reversingUnit,
          ),
          unit: reverseState.reversingUnit,
        },
      };

      const newState = applyResolveReverseEvent(event, state);

      const boardSpace = newState.boardState.board['E-5'];
      expect(boardSpace?.unitPresence.presenceType).toBe('single');
      if (boardSpace?.unitPresence.presenceType === 'single') {
        expect(boardSpace.unitPresence.facing).toBe('south');
        expect(boardSpace.unitPresence.unit).toStrictEqual(
          reverseState.reversingUnit,
        );
      }
    });

    it('given same event, reverse substep completed and finalPosition matches placement', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = throwIfBypassed(
        getReverseStateFromAttackApply(attackApplyState),
        'the attack applies a reverse',
      );

      const newPlacement = placed(reverseState.reversingUnit, 'E-5', 'south');

      const event: ResolveReverseEvent = {
        attackResolutionContext: 'rangedAttack',
        effectType: 'resolveReverse',
        eventNumber: 0,
        eventType: 'gameEffect',
        newUnitPlacement: newPlacement,
        // The event records where the unit stood when it turned, which the
        // substep no longer carries.
        unitInstance: {
          placement: getPositionOfUnit(
            state.boardState,
            reverseState.reversingUnit,
          ),
          unit: reverseState.reversingUnit,
        },
      };

      const newState = applyResolveReverseEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);
      const newReverseState = throwIfBypassed(
        getReverseStateFromAttackApply(newAttackApplyState),
        'the attack applies a reverse',
      );

      expect(newReverseState.completed).toBe(true);
      expect(newReverseState.finalPosition).toStrictEqual(
        newPlacement.placement,
      );
    });

    it('given black observer on D-5, reverse apply leaves D-5 untouched', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = throwIfBypassed(
        getReverseStateFromAttackApply(attackApplyState),
        'the attack applies a reverse',
      );

      // Add another unit at a different location
      const otherUnit = createTestUnit('black', { attack: 2 });
      const stateWithOtherUnit = {
        ...state,
        boardState: addUnitToBoard(
          state.boardState,
          placed(otherUnit, 'D-5', 'north'),
        ),
      };

      const newPlacement = placed(reverseState.reversingUnit, 'E-5', 'south');

      const event: ResolveReverseEvent = {
        attackResolutionContext: 'rangedAttack',
        effectType: 'resolveReverse',
        eventNumber: 0,
        eventType: 'gameEffect',
        newUnitPlacement: newPlacement,
        // The event records where the unit stood when it turned, which the
        // substep no longer carries.
        unitInstance: {
          placement: getPositionOfUnit(
            state.boardState,
            reverseState.reversingUnit,
          ),
          unit: reverseState.reversingUnit,
        },
      };

      const newState = applyResolveReverseEvent(event, stateWithOtherUnit);

      // Other unit should still be at D-5
      const otherSpace = newState.boardState.board['D-5'];
      expect(otherSpace?.unitPresence.presenceType).toBe('single');
      if (otherSpace?.unitPresence.presenceType === 'single') {
        expect(otherSpace.unitPresence.unit).toStrictEqual(otherUnit);
      }
    });
  });

  describe('melee reverse substep', () => {
    it('given black reverses south on E-5, black apply reverse completed and board updated', () => {
      const state = createStateWithMeleeReverse('black');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'black');
      const reverseState = throwIfBypassed(
        getReverseStateFromAttackApply(attackApplyState),
        'the attack applies a reverse',
      );

      const newPlacement = placed(reverseState.reversingUnit, 'E-5', 'south');

      const event: ResolveReverseEvent = {
        attackResolutionContext: 'melee',
        effectType: 'resolveReverse',
        eventNumber: 0,
        eventType: 'gameEffect',
        newUnitPlacement: newPlacement,
        // The event records where the unit stood when it turned, which the
        // substep no longer carries.
        unitInstance: {
          placement: getPositionOfUnit(
            state.boardState,
            reverseState.reversingUnit,
          ),
          unit: reverseState.reversingUnit,
        },
      };

      const newState = applyResolveReverseEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromMelee(
        newState,
        'black',
      );
      const newReverseState = throwIfBypassed(
        getReverseStateFromAttackApply(newAttackApplyState),
        'the attack applies a reverse',
      );

      expect(newReverseState.completed).toBe(true);
      expect(newReverseState.finalPosition).toStrictEqual(
        newPlacement.placement,
      );

      const boardSpace = newState.boardState.board['E-5'];
      expect(boardSpace?.unitPresence.presenceType).toBe('single');
    });

    it('given white reverses east on E-5, white reverse completed and finalPosition east', () => {
      const state = createStateWithMeleeReverse('white');
      const attackApplyState = getAttackApplyStateFromMelee(state, 'white');
      const reverseState = throwIfBypassed(
        getReverseStateFromAttackApply(attackApplyState),
        'the attack applies a reverse',
      );

      const newPlacement = placed(reverseState.reversingUnit, 'E-5', 'east');

      const event: ResolveReverseEvent = {
        attackResolutionContext: 'melee',
        effectType: 'resolveReverse',
        eventNumber: 0,
        eventType: 'gameEffect',
        newUnitPlacement: newPlacement,
        // The event records where the unit stood when it turned, which the
        // substep no longer carries.
        unitInstance: {
          placement: getPositionOfUnit(
            state.boardState,
            reverseState.reversingUnit,
          ),
          unit: reverseState.reversingUnit,
        },
      };

      const newState = applyResolveReverseEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromMelee(
        newState,
        'white',
      );
      const newReverseState = throwIfBypassed(
        getReverseStateFromAttackApply(newAttackApplyState),
        'the attack applies a reverse',
      );

      expect(newReverseState.completed).toBe(true);
      expect(newReverseState.finalPosition).toStrictEqual(
        newPlacement.placement,
      );
    });
  });

  describe('structural update', () => {
    it('given reverse completed and board ref before apply, input slice unchanged after apply', () => {
      const state = createStateWithRangedAttackReverse();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const reverseState = throwIfBypassed(
        getReverseStateFromAttackApply(attackApplyState),
        'the attack applies a reverse',
      );
      const originalCompleted = reverseState.completed;
      const originalBoardState = state.boardState;

      const newPlacement = placed(reverseState.reversingUnit, 'E-5', 'south');

      const event: ResolveReverseEvent = {
        attackResolutionContext: 'rangedAttack',
        effectType: 'resolveReverse',
        eventNumber: 0,
        eventType: 'gameEffect',
        newUnitPlacement: newPlacement,
        // The event records where the unit stood when it turned, which the
        // substep no longer carries.
        unitInstance: {
          placement: getPositionOfUnit(
            state.boardState,
            reverseState.reversingUnit,
          ),
          unit: reverseState.reversingUnit,
        },
      };

      applyResolveReverseEvent(event, state);

      expect(reverseState.completed).toBe(originalCompleted);
      expect(state.boardState).toBe(originalBoardState);
    });
  });
});
