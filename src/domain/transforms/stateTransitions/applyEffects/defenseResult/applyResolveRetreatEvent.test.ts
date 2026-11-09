import type { ResolveRetreatEvent } from '@events';
import type { GameState } from '@game';
import {
  getFrontEngagementStateFromMovement,
  getFrontEngagementRetreatState,
  getMeleeRetreatState,
  getRangedAttackRetreatState,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  placed,
} from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyResolveRetreatEvent } from './applyResolveRetreatEvent';

import { createEmptyGameState } from '@factories';
/**
 * Applies a committed retreat: removes the unit from `startingPosition`, places it at
 * `finalPosition`, and marks the nested retreat substep completed (ranged or melee side).
 */
describe('applyResolveRetreatEvent function', () => {
  // A unit on E-5 facing north falls straight back one step, to F-5.
  const stepBack = {
    path: ['step' as const],
    placement: { coordinate: 'F-5' as const, facing: 'north' as const },
  };

  /** IssueCommands + ranged CRS + retreat substep for white on E-5. */
  function createStateWithRangedAttackRetreat(): GameState {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(retreatingUnit, 'E-5', 'north');

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

  /** ResolveMelee + one-sided retreat apply for the named player on engaged E-5. */
  function createStateWithMeleeRetreat(
    retreatingPlayer: 'white' | 'black',
  ): GameState {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      {
        attack: 2,
      },
    );

    const retreatingUnitWithPlacement = placed(retreatingUnit, 'E-5', 'north');
    const otherUnitWithPlacement = placed(otherUnit, 'E-5', 'south');

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
    const meleeState = createMeleeResolutionState(
      stateWithUnits,
      retreatingPlayer === 'white'
        ? { secondPlayerAttackApplyState: attackApplyState }
        : { firstPlayerAttackApplyState: attackApplyState },
    );
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe('ranged retreat apply', () => {
    it('given ranged retreat and event F-5 north, E-5 clears and F-5 holds retreating unit', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRangedAttackRetreatState(state);

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const newState = applyResolveRetreatEvent(event, state);

      // Unit should be removed from starting position
      const startingSpace = newState.boardState.board['E-5'];
      expect(startingSpace?.unitPresence.presenceType).toBe('none');

      // Unit should be added to final position
      const finalSpace = newState.boardState.board['F-5'];
      expect(finalSpace?.unitPresence.presenceType).toBe('single');
      if (finalSpace?.unitPresence.presenceType === 'single') {
        expect(finalSpace.unitPresence.unit).toStrictEqual(
          retreatState.retreatingUnit.unit,
        );
        expect(finalSpace.unitPresence.facing).toBe('north');
      }
    });

    it('given same flow, ranged retreat substep completed becomes true', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRangedAttackRetreatState(state);

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getRangedAttackRetreatState(newState);

      expect(newRetreatState.completed).toBe(true);
    });

    it('given extra black unit on D-5, after retreat D-5 single presence unchanged', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRangedAttackRetreatState(state);

      // Add another unit at a different location
      const otherUnit = createTestUnit('black', { attack: 2 });
      const stateWithOtherUnit = {
        ...state,
        boardState: addUnitToBoard(
          state.boardState,
          placed(otherUnit, 'D-5', 'north'),
        ),
      };

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const newState = applyResolveRetreatEvent(event, stateWithOtherUnit);

      // Other unit should still be at D-5
      const otherSpace = newState.boardState.board['D-5'];
      expect(otherSpace?.unitPresence.presenceType).toBe('single');
      if (otherSpace?.unitPresence.presenceType === 'single') {
        expect(otherSpace.unitPresence.unit).toStrictEqual(otherUnit);
      }
    });
  });

  describe('melee retreat apply', () => {
    it('given black retreats off E-5 to F-5, retreat completed and both hexes single occupancy', () => {
      const state = createStateWithMeleeRetreat('black');
      const retreatState = getMeleeRetreatState(state, 'black');

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getMeleeRetreatState(newState, 'black');

      expect(newRetreatState.completed).toBe(true);
      expect(newState.boardState.board['E-5']?.unitPresence.presenceType).toBe(
        'single',
      );
      expect(newState.boardState.board['F-5']?.unitPresence.presenceType).toBe(
        'single',
      );
    });

    it('given white retreats to F-5 north, retreat completed and white on F-5', () => {
      const state = createStateWithMeleeRetreat('white');
      const retreatState = getMeleeRetreatState(state, 'white');

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getMeleeRetreatState(newState, 'white');

      expect(newRetreatState.completed).toBe(true);
      expect(newState.boardState.board['E-5']?.unitPresence.presenceType).toBe(
        'single',
      );
      expect(newState.boardState.board['F-5']?.unitPresence.presenceType).toBe(
        'single',
      );
    });
  });

  describe('commander with the retreating unit', () => {
    it("the retreating unit's own commander in its space ends in the unit's final space (§9.1.8)", () => {
      const base = createStateWithRangedAttackRetreat();
      // White's commander stands in E-5 with the unit about to fall back.
      const state = {
        ...base,
        boardState: addCommanderToBoard(base.boardState, 'white', 'E-5'),
      };
      const retreatState = getRangedAttackRetreatState(state);

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const newState = applyResolveRetreatEvent(event, state);

      // The commander leaves E-5 and arrives on F-5 with its unit.
      expect(newState.boardState.board['E-5']?.commanders).toStrictEqual([]);
      expect(newState.boardState.board['F-5']?.commanders).toStrictEqual([
        'white',
      ]);
    });

    it("an enemy commander in the retreating unit's space stays put (§9.1.8)", () => {
      const base = createStateWithRangedAttackRetreat();
      // Black's commander stands in E-5 too, as it would having ridden its own
      // unit into the fight (§4.3.10). It is not white's to carry off.
      const state = {
        ...base,
        boardState: addCommanderToBoard(base.boardState, 'black', 'E-5'),
      };
      const retreatState = getRangedAttackRetreatState(state);

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const newState = applyResolveRetreatEvent(event, state);

      // White's unit moved on, but black's commander did not follow it.
      expect(newState.boardState.board['E-5']?.commanders).toStrictEqual([
        'black',
      ]);
      expect(newState.boardState.board['F-5']?.commanders).toStrictEqual([]);
    });
  });

  describe('structural update', () => {
    it('given retreat completed flag and board ref before apply, input unchanged after apply', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRangedAttackRetreatState(state);
      const originalCompleted = retreatState.completed;
      const originalBoardState = state.boardState;

      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(retreatState.retreatingUnit.unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      applyResolveRetreatEvent(event, state);

      expect(retreatState.completed).toBe(originalCompleted);
      expect(state.boardState).toBe(originalBoardState);
    });
  });

  describe('front engagement retreat apply', () => {
    it('moves the defender and completes the engagement', () => {
      const state = createEmptyGameState('standard');
      const unit = createTestUnit('white', { attack: 2 });
      const placement = placed(unit, 'E-5', 'north');
      const withBoard = {
        ...state,
        boardState: addUnitToBoard(state.boardState, placement),
      };
      const withEngagement = updatePhaseState(
        withBoard,
        createIssueCommandsPhaseState(withBoard, {
          currentCommandResolutionState: createMovementResolutionState(
            withBoard,
            {
              engagementState: createFrontEngagementState({
                defendingUnitRetreats: true,
                retreatState: createRetreatState(placement, {
                  chosenRetreat: stepBack,
                  legalRetreatOptions: [stepBack],
                }),
              }),
            },
          ),
        }),
      );
      const retreatState = getFrontEngagementRetreatState(withEngagement);
      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        finalPosition: placed(unit, 'F-5', 'north'),
        path: ['step'],
        startingPosition: retreatState.retreatingUnit,
      };

      const next = applyResolveRetreatEvent(event, withEngagement);
      const engagement = getFrontEngagementStateFromMovement(next);

      expect(next.boardState.board['E-5']?.unitPresence.presenceType).toBe(
        'none',
      );
      expect(next.boardState.board['F-5']?.unitPresence.presenceType).toBe(
        'single',
      );
      expect(getFrontEngagementRetreatState(next).completed).toBe(true);
      expect(engagement.completed).toBe(true);
    });
  });
});
