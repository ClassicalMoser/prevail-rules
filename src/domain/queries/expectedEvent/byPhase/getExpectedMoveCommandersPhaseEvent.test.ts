import type { GameState, StandardBoard } from '@entities';
import { MOVE_COMMANDERS_PHASE } from '@entities';
import { expectedGameEffectSchema, expectedPlayerInputSchema } from '@events';
import { createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getExpectedMoveCommandersPhaseEvent } from './getExpectedMoveCommandersPhaseEvent';

/**
 * getExpectedMoveCommandersPhaseEvent: next event during move-commanders phase.
 */
describe('getExpectedMoveCommandersPhaseEvent', () => {
  /**
   * Helper to create a game state in the moveCommanders phase with a specific step
   */
  function createGameStateInMoveCommandersStep(
    step: 'moveFirstCommander' | 'moveSecondCommander' | 'complete',
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });

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
      const resultIsExpectedPlayerInput =
        expectedPlayerInputSchema.safeParse(expectedEvent);
      expect(resultIsExpectedPlayerInput.success).toBe(true);
      expect(resultIsExpectedPlayerInput.data?.playerSource).toBe('black');
      expect(resultIsExpectedPlayerInput.data?.choiceType).toBe(
        'moveCommander',
      );
    });

    it('given step is moveSecondCommander, returns secondPlayer moveCommander', () => {
      const state = createGameStateInMoveCommandersStep(
        'moveSecondCommander',
        'black',
      );

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe('playerChoice');
      const resultIsExpectedPlayerInput =
        expectedPlayerInputSchema.safeParse(expectedEvent);
      expect(resultIsExpectedPlayerInput.success).toBe(true);
      expect(resultIsExpectedPlayerInput.data?.playerSource).toBe('white');
      expect(resultIsExpectedPlayerInput.data?.choiceType).toBe(
        'moveCommander',
      );
    });

    it('given step is complete, returns completeMoveCommandersPhase gameEffect', () => {
      const state = createGameStateInMoveCommandersStep('complete');

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(expectedEvent);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe(
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
      const resultIsExpectedPlayerInputWhite =
        expectedPlayerInputSchema.safeParse(expectedEventWhite);
      expect(resultIsExpectedPlayerInputWhite.success).toBe(true);
      expect(resultIsExpectedPlayerInputWhite.data?.playerSource).toBe('white');
      expect(resultIsExpectedPlayerInputWhite.data?.choiceType).toBe(
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
      const resultIsExpectedPlayerInputBlack =
        expectedPlayerInputSchema.safeParse(expectedEventBlack);
      expect(resultIsExpectedPlayerInputBlack.success).toBe(true);
      expect(resultIsExpectedPlayerInputBlack.data?.playerSource).toBe('black');
      expect(resultIsExpectedPlayerInputBlack.data?.choiceType).toBe(
        'moveCommander',
      );
    });
  });

  describe('error cases', () => {
    it('given for invalid step, throws', () => {
      const state = createGameStateInMoveCommandersStep('moveFirstCommander');
      // Bad type cast to test default case
      const stateWithInvalidStep = {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: {
            ...state.currentRoundState.currentPhaseState!,
            step: 'invalidStep' as any,
          },
        },
      };

      expect(() =>
        getExpectedMoveCommandersPhaseEvent(stateWithInvalidStep),
      ).toThrow('Invalid moveCommanders phase step: invalidStep');
    });
  });
});
