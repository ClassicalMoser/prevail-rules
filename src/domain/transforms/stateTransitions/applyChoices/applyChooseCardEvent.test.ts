import type { GameState, StandardBoard } from '@entities';
import type { ChooseCardEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { withCardState, withPhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseCardEvent } from './applyChooseCardEvent';

describe('applyChooseCardEvent', () => {
  /**
   * Helper to create a game state in the playCards phase, chooseCards step
   */
  function createGameStateInChooseCardsStep(
    blackHand: typeof commandCards,
    whiteHand: typeof commandCards,
  ): GameState<StandardBoard> {
    const state = createEmptyGameState();

    // Set up card state with hands and no awaiting cards
    const stateWithCards = withCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inHand: [...blackHand], awaitingPlay: null },
      white: { ...current.white, inHand: [...whiteHand], awaitingPlay: null },
    }));

    // Set up phase state
    const stateWithPhase = withPhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should move card from hand to awaitingPlay for black player', () => {
      const state = createGameStateInChooseCardsStep(
        [commandCards[0], commandCards[1]],
        [commandCards[2]],
      );

      const event: ChooseCardEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: commandCards[0],
      };

      const newState = applyChooseCardEvent(event, state);

      // Card should be removed from hand
      expect(newState.cardState.black.inHand).toEqual([commandCards[1]]);
      // Card should be in awaitingPlay
      expect(newState.cardState.black.awaitingPlay).toBe(commandCards[0]);
      // White player's state should be unchanged
      expect(newState.cardState.white.inHand).toEqual([commandCards[2]]);
      expect(newState.cardState.white.awaitingPlay).toBeNull();
    });

    it('should move card from hand to awaitingPlay for white player', () => {
      const state = createGameStateInChooseCardsStep(
        [commandCards[0]],
        [commandCards[1], commandCards[2]],
      );

      const event: ChooseCardEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'white',
        card: commandCards[1],
      };

      const newState = applyChooseCardEvent(event, state);

      // Card should be removed from hand
      expect(newState.cardState.white.inHand).toEqual([commandCards[2]]);
      // Card should be in awaitingPlay
      expect(newState.cardState.white.awaitingPlay).toBe(commandCards[1]);
      // Black player's state should be unchanged
      expect(newState.cardState.black.inHand).toEqual([commandCards[0]]);
      expect(newState.cardState.black.awaitingPlay).toBeNull();
    });
  });

  describe('step advancement', () => {
    it('should advance to revealCards step if both players have chosen cards', () => {
      const state = createGameStateInChooseCardsStep(
        [commandCards[0]],
        [commandCards[1]],
      );

      // First player chooses
      const firstEvent: ChooseCardEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: commandCards[0],
      };
      const afterFirst = applyChooseCardEvent(firstEvent, state);

      // Should still be on chooseCards step
      expect(afterFirst.currentRoundState.currentPhaseState?.step).toBe(
        'chooseCards',
      );

      // Second player chooses
      const secondEvent: ChooseCardEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'white',
        card: commandCards[1],
      };
      const afterSecond = applyChooseCardEvent(secondEvent, afterFirst);

      // Should now be on revealCards step
      expect(afterSecond.currentRoundState.currentPhaseState?.step).toBe(
        'revealCards',
      );
    });

    it('should not advance step if only one player has chosen', () => {
      const state = createGameStateInChooseCardsStep(
        [commandCards[0], commandCards[1]],
        [commandCards[2]],
      );

      const event: ChooseCardEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: commandCards[0],
      };

      const newState = applyChooseCardEvent(event, state);

      // Should still be on chooseCards step
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'chooseCards',
      );
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createGameStateInChooseCardsStep(
        [commandCards[0], commandCards[1]],
        [commandCards[2]],
      );
      const originalHand = [...state.cardState.black.inHand];

      const event: ChooseCardEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: commandCards[0],
      };

      applyChooseCardEvent(event, state);

      // Original state should be unchanged
      expect(state.cardState.black.inHand).toEqual(originalHand);
      expect(state.cardState.black.awaitingPlay).toBeNull();
    });
  });
});
