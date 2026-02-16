import type { GameState, StandardBoard } from '@entities';
import { MOVE_COMMANDERS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';

describe('generateCompleteMoveCommandersPhaseEvent', () => {
  /**
   * Helper to create a game state in the moveCommanders phase, complete step
   * with cards in play for both players
   */
  function createGameStateInCompleteStep(): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });

    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inPlay: commandCards[0],
      },
      white: {
        ...current.white,
        inPlay: commandCards[1],
      },
    }));

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should return a completeMoveCommandersPhase event', () => {
      const state = createGameStateInCompleteStep();

      const event = generateCompleteMoveCommandersPhaseEvent(state);

      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe('completeMoveCommandersPhase');
    });

    it('should extract first player commands from cards in play', () => {
      const state = createGameStateInCompleteStep();

      const event = generateCompleteMoveCommandersPhaseEvent(state);

      // Black is initiative holder (first player)
      const blackCard = commandCards[0]!;
      expect(event.firstPlayerCommands).toEqual(
        new Set([blackCard.command]),
      );
    });

    it('should extract second player commands from cards in play', () => {
      const state = createGameStateInCompleteStep();

      const event = generateCompleteMoveCommandersPhaseEvent(state);

      // White is second player
      const whiteCard = commandCards[1]!;
      expect(event.secondPlayerCommands).toEqual(
        new Set([whiteCard.command]),
      );
    });

    it('should throw if first or second player card not found', () => {
      const state = createEmptyGameState({ currentInitiative: 'black' });
      const stateWithNoCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          inPlay: null,
        },
        white: {
          ...current.white,
          inPlay: null,
        },
      }));
      const stateWithPhase = updatePhaseState(stateWithNoCards, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'complete',
      });

      expect(() =>
        generateCompleteMoveCommandersPhaseEvent(stateWithPhase),
      ).toThrow('First or second player card not found');
    });
  });
});
