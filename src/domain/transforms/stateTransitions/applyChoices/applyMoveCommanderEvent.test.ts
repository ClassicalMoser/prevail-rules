import type {
  GameState,
  StandardBoard,
  StandardBoardCoordinate,
} from '@entities';
import type { MoveCommanderEvent } from '@events';
import { MOVE_COMMANDERS_PHASE } from '@entities';
import { createBoardWithCommander, createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyMoveCommanderEvent } from './applyMoveCommanderEvent';

/**
 * Move-commanders phase: each side relocates their commander token on the board; after the
 * second move the step becomes `complete`.
 */
describe('applyMoveCommanderEvent', () => {
  /** moveCommanders phase at the given step with default black E-5 / white E-6 commanders. */
  function createGameStateInMoveCommandersStep(
    step: 'moveFirstCommander' | 'moveSecondCommander',
    blackCommanderCoord: StandardBoardCoordinate = 'E-5',
    whiteCommanderCoord: StandardBoardCoordinate = 'E-6',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });

    let board = createBoardWithCommander('black', blackCommanderCoord);
    board = createBoardWithCommander('white', whiteCommanderCoord, board);

    const stateWithBoard = {
      ...state,
      boardState: board,
    };

    const stateWithPhase = updatePhaseState(stateWithBoard, {
      phase: MOVE_COMMANDERS_PHASE,
      step,
    });

    return stateWithPhase;
  }

  describe('board placement', () => {
    it('given moveFirstCommander and black E-5 to E-7, black leaves E-5 and white still on E-6', () => {
      const state = createGameStateInMoveCommandersStep(
        'moveFirstCommander',
        'E-5',
        'E-6',
      );

      const event: MoveCommanderEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'moveCommander',
        player: 'black',
        from: 'E-5',
        to: 'E-7',
      };

      const newState = applyMoveCommanderEvent(event, state);

      // Commander should be removed from original location
      expect(newState.boardState.board['E-5']?.commanders.has('black')).toBe(
        false,
      );
      // Commander should be at new location
      expect(newState.boardState.board['E-7']?.commanders.has('black')).toBe(
        true,
      );
      // White commander should be unchanged
      expect(newState.boardState.board['E-6']?.commanders.has('white')).toBe(
        true,
      );
    });

    it('given moveSecondCommander and white E-6 to E-8, white leaves E-6 and black still on E-5', () => {
      const state = createGameStateInMoveCommandersStep(
        'moveSecondCommander',
        'E-5',
        'E-6',
      );

      const event: MoveCommanderEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'moveCommander',
        player: 'white',
        from: 'E-6',
        to: 'E-8',
      };

      const newState = applyMoveCommanderEvent(event, state);

      // Commander should be removed from original location
      expect(newState.boardState.board['E-6']?.commanders.has('white')).toBe(
        false,
      );
      // Commander should be at new location
      expect(newState.boardState.board['E-8']?.commanders.has('white')).toBe(
        true,
      );
      // Black commander should be unchanged
      expect(newState.boardState.board['E-5']?.commanders.has('black')).toBe(
        true,
      );
    });
  });

  describe('step progression', () => {
    it('given black completes first commander move, phase step is moveSecondCommander', () => {
      const state = createGameStateInMoveCommandersStep('moveFirstCommander');

      const event: MoveCommanderEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'moveCommander',
        player: 'black',
        from: 'E-5',
        to: 'E-7',
      };

      const newState = applyMoveCommanderEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'moveSecondCommander',
      );
    });

    it('given white completes second commander move, phase step is complete', () => {
      const state = createGameStateInMoveCommandersStep('moveSecondCommander');

      const event: MoveCommanderEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'moveCommander',
        player: 'white',
        from: 'E-6',
        to: 'E-8',
      };

      const newState = applyMoveCommanderEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'complete',
      );
    });
  });

  describe('structural update', () => {
    it('given black commander and step before apply, input board and step unchanged after apply', () => {
      const state = createGameStateInMoveCommandersStep('moveFirstCommander');
      const originalBlackCommanderPresent =
        state.boardState.board['E-5']?.commanders.has('black');
      const originalStep = state.currentRoundState.currentPhaseState?.step;

      const event: MoveCommanderEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'moveCommander',
        player: 'black',
        from: 'E-5',
        to: 'E-7',
      };

      applyMoveCommanderEvent(event, state);

      expect(state.boardState.board['E-5']?.commanders.has('black')).toBe(
        originalBlackCommanderPresent,
      );
      expect(state.currentRoundState.currentPhaseState?.step).toBe(
        originalStep,
      );
    });
  });
});
