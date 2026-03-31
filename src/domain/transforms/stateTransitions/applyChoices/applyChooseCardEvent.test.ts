import type { StandardBoard } from '@entities';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseCardEvent } from './applyChooseCardEvent';

/**
 * Play-cards `chooseCards`: the chosen command card leaves `inHand` and sits in `awaitingPlay`
 * until both sides pick; then the round step advances to `revealCards`.
 */
describe('applyChooseCardEvent', () => {
  /** playCards.chooseCards with the supplied hands and no card awaiting play yet. */
  function createGameStateInChooseCardsStep(
    blackHand: typeof tempCommandCards,
    whiteHand: typeof tempCommandCards,
  ): GameState<StandardBoard> {
    const state = createEmptyGameState();

    // Set up card state with hands and no awaiting cards
    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inHand: [...blackHand], awaitingPlay: null },
      white: { ...current.white, inHand: [...whiteHand], awaitingPlay: null },
    }));

    // Set up phase state
    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    return stateWithPhase;
  }

  describe('hand and awaitingPlay', () => {
    it('given black picks first card from two in hand, that card is awaitingPlay and hand shrinks', () => {
      const state = createGameStateInChooseCardsStep(
        [tempCommandCards[0], tempCommandCards[1]],
        [tempCommandCards[2]],
      );

      const event: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: tempCommandCards[0],
      };

      const newState = applyChooseCardEvent(event, state);

      // Card should be removed from hand
      expect(newState.cardState.black.inHand).toEqual([tempCommandCards[1]]);
      // Card should be in awaitingPlay
      expect(newState.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
      // White player's state should be unchanged
      expect(newState.cardState.white.inHand).toEqual([tempCommandCards[2]]);
      expect(newState.cardState.white.awaitingPlay).toBeNull();
    });

    it('given white picks middle card, white hand and awaitingPlay update and black unchanged', () => {
      const state = createGameStateInChooseCardsStep(
        [tempCommandCards[0]],
        [tempCommandCards[1], tempCommandCards[2]],
      );

      const event: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'white',
        card: tempCommandCards[1],
      };

      const newState = applyChooseCardEvent(event, state);

      // Card should be removed from hand
      expect(newState.cardState.white.inHand).toEqual([tempCommandCards[2]]);
      // Card should be in awaitingPlay
      expect(newState.cardState.white.awaitingPlay).toBe(tempCommandCards[1]);
      // Black player's state should be unchanged
      expect(newState.cardState.black.inHand).toEqual([tempCommandCards[0]]);
      expect(newState.cardState.black.awaitingPlay).toBeNull();
    });
  });

  describe('when both sides have chosen', () => {
    it('given black then white each choose their only card, step becomes revealCards', () => {
      const state = createGameStateInChooseCardsStep(
        [tempCommandCards[0]],
        [tempCommandCards[1]],
      );

      // First player chooses
      const firstEvent: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: tempCommandCards[0],
      };
      const afterFirst = applyChooseCardEvent(firstEvent, state);

      // Should still be on chooseCards step
      expect(afterFirst.currentRoundState.currentPhaseState?.step).toBe(
        'chooseCards',
      );

      // Second player chooses
      const secondEvent: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'white',
        card: tempCommandCards[1],
      };
      const afterSecond = applyChooseCardEvent(secondEvent, afterFirst);

      // Should now be on revealCards step
      expect(afterSecond.currentRoundState.currentPhaseState?.step).toBe(
        'revealCards',
      );
    });

    it('given only black chooses while white still has a card, step stays chooseCards', () => {
      const state = createGameStateInChooseCardsStep(
        [tempCommandCards[0], tempCommandCards[1]],
        [tempCommandCards[2]],
      );

      const event: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: tempCommandCards[0],
      };

      const newState = applyChooseCardEvent(event, state);

      // Should still be on chooseCards step
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'chooseCards',
      );
    });
  });

  describe('structural update', () => {
    it('given prior black hand snapshot, apply leaves input state object unchanged', () => {
      const state = createGameStateInChooseCardsStep(
        [tempCommandCards[0], tempCommandCards[1]],
        [tempCommandCards[2]],
      );
      const originalHand = [...state.cardState.black.inHand];

      const event: ChooseCardEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'playerChoice',
        choiceType: 'chooseCard',
        player: 'black',
        card: tempCommandCards[0],
      };

      applyChooseCardEvent(event, state);

      // Original state should be unchanged
      expect(state.cardState.black.inHand).toEqual(originalHand);
      expect(state.cardState.black.awaitingPlay).toBeNull();
    });
  });
});
