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

describe('applyMoveCommanderEvent', () => {
  /**
   * Helper to create a game state in the moveCommanders phase with commanders on the board
   */
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

  describe('basic functionality', () => {
    it('should move black commander from one coordinate to another', () => {
      const state = createGameStateInMoveCommandersStep(
        'moveFirstCommander',
        'E-5',
        'E-6',
      );

      const event: MoveCommanderEvent<StandardBoard> = {
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

    it('should move white commander from one coordinate to another', () => {
      const state = createGameStateInMoveCommandersStep(
        'moveSecondCommander',
        'E-5',
        'E-6',
      );

      const event: MoveCommanderEvent<StandardBoard> = {
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

  describe('step advancement', () => {
    it('should advance from moveFirstCommander to moveSecondCommander', () => {
      const state = createGameStateInMoveCommandersStep('moveFirstCommander');

      const event: MoveCommanderEvent<StandardBoard> = {
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

    it('should advance from moveSecondCommander to complete', () => {
      const state = createGameStateInMoveCommandersStep('moveSecondCommander');

      const event: MoveCommanderEvent<StandardBoard> = {
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

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createGameStateInMoveCommandersStep('moveFirstCommander');
      const originalBlackCommanderPresent =
        state.boardState.board['E-5']?.commanders.has('black');
      const originalStep = state.currentRoundState.currentPhaseState?.step;

      const event: MoveCommanderEvent<StandardBoard> = {
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

  describe('error cases', () => {
    it('should throw if step is not moveFirstCommander or moveSecondCommander', () => {
      const state = createGameStateInMoveCommandersStep('moveFirstCommander');
      const stateWithCompleteStep = updatePhaseState(state, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'complete',
      });

      const event: MoveCommanderEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'moveCommander',
        player: 'black',
        from: 'E-5',
        to: 'E-7',
      };

      expect(() => applyMoveCommanderEvent(event, stateWithCompleteStep)).toThrow(
        'Invalid move commanders phase step: complete',
      );
    });
  });
});
