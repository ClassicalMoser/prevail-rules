import type { GameState } from '@game';

import { MOVE_COMMANDERS_PHASE } from '@game';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getExpectedMoveCommandersPhaseEvent } from './getExpectedMoveCommandersPhaseEvent';
import type { ExpectedGameEffect, ExpectedPlayerInput } from '@events';

import { createEmptyGameState } from '@factories';
/**
 * GetExpectedMoveCommandersPhaseEvent: next event during move-commanders phase.
 */
describe(getExpectedMoveCommandersPhaseEvent, () => {
  /**
   * Helper to create a game state in the moveCommanders phase with a specific step
   */
  function createGameStateInMoveCommandersStep(
    step: 'moveFirstCommander' | 'moveSecondCommander' | 'complete',
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      currentInitiative,
    );

    const stateWithPhase = updatePhaseState(state, {
      phase: MOVE_COMMANDERS_PHASE,
      step,
    });

    return stateWithPhase;
  }

  describe('expected events by step', () => {
    it('given step is moveFirstCommander, returns firstPlayer moveCommander', () => {
      const state = createGameStateInMoveCommandersStep(
        'moveFirstCommander',
        'black',
      );

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe('playerChoice');
    });

    it('given step is moveSecondCommander, returns secondPlayer moveCommander', () => {
      const state = createGameStateInMoveCommandersStep(
        'moveSecondCommander',
        'black',
      );

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe('playerChoice');
    });

    it('given step is complete, returns completeMoveCommandersPhase gameEffect', () => {
      const state = createGameStateInMoveCommandersStep('complete');

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe('gameEffect');
      expect((expectedEvent as ExpectedGameEffect).effectType).toBe(
        'completeMoveCommandersPhase',
      );
    });

    it('given correctly identify first and second player based on initiative', () => {
      // Test with white as initiative
      const stateWithWhiteInitiative = createGameStateInMoveCommandersStep(
        'moveFirstCommander',
        'white',
      );

      const expectedEventWhite = getExpectedMoveCommandersPhaseEvent(
        stateWithWhiteInitiative,
      );

      expect(expectedEventWhite.actionType).toBe('playerChoice');
      expect((expectedEventWhite as ExpectedPlayerInput).playerSource).toBe(
        'white',
      );
      expect((expectedEventWhite as ExpectedPlayerInput).choiceType).toBe(
        'moveCommander',
      );

      // Test with black as initiative
      const stateWithBlackInitiative = createGameStateInMoveCommandersStep(
        'moveFirstCommander',
        'black',
      );

      const expectedEventBlack = getExpectedMoveCommandersPhaseEvent(
        stateWithBlackInitiative,
      );

      expect(expectedEventBlack.actionType).toBe('playerChoice');
      expect((expectedEventBlack as ExpectedPlayerInput).playerSource).toBe(
        'black',
      );
      expect((expectedEventBlack as ExpectedPlayerInput).choiceType).toBe(
        'moveCommander',
      );
    });
  });

  describe('error cases', () => {
    it('given for invalid step, throws', () => {
      const state = createGameStateInMoveCommandersStep('moveFirstCommander');
      const phaseState = state.currentRoundState.currentPhaseState;
      if (phaseState === 'none') {
        throw new Error('expected phase state');
      }
      phaseState.step = 'invalidStep' as unknown as typeof phaseState.step; // Intentionally bad type cast to test error path

      expect(() => getExpectedMoveCommandersPhaseEvent(state)).toThrow(
        'Invalid moveCommanders phase step: invalidStep',
      );
    });
  });
});
