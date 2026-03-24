import type { GameState, StandardBoard } from '@entities';
import type { RevealCardsEvent } from '@events';
import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyRevealCardsEvent } from './applyRevealCardsEvent';

/**
 * After simultaneous picks, `revealCards` promotes both `awaitingPlay` slots to `inPlay` and
 * advances playCards to `assignInitiative`. Guards ensure both sides had a pending card when
 * the step really is revealCards.
 */
describe('applyRevealCardsEvent', () => {
  /** playCards.revealCards with black/white awaitingPlay set and inPlay empty. */
  function createGameStateInRevealCardsStep(): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        awaitingPlay: commandCards[0],
        inPlay: null,
      },
      white: {
        ...current.white,
        awaitingPlay: commandCards[1],
        inPlay: null,
      },
    }));

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });

    return stateWithPhase;
  }

  describe('reveal and step', () => {
    it('given both awaitingPlay set, inPlay receives those cards and awaitingPlay clears', () => {
      const state = createGameStateInRevealCardsStep();
      const blackCard = state.cardState.black.awaitingPlay;
      const whiteCard = state.cardState.white.awaitingPlay;

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      const newState = applyRevealCardsEvent(event, state);

      // Black card should be moved to inPlay
      expect(newState.cardState.black.inPlay).toBe(blackCard);
      expect(newState.cardState.black.awaitingPlay).toBeNull();

      // White card should be moved to inPlay
      expect(newState.cardState.white.inPlay).toBe(whiteCard);
      expect(newState.cardState.white.awaitingPlay).toBeNull();
    });

    it('given revealCards step, next playCards step is assignInitiative', () => {
      const state = createGameStateInRevealCardsStep();

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      const newState = applyRevealCardsEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'assignInitiative',
      );
    });
  });

  describe('guards and mechanical reveal', () => {
    it('given no current phase slice, throws no current phase state', () => {
      const state = createEmptyGameState();

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      expect(() => applyRevealCardsEvent(event, state)).toThrow(
        'No current phase state found',
      );
    });

    it('given moveCommanders phase, throws expected playCards phase', () => {
      const state = createEmptyGameState();
      const stateWithWrongPhase = updatePhaseState(state, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'moveFirstCommander',
      });

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      expect(() => applyRevealCardsEvent(event, stateWithWrongPhase)).toThrow(
        'Expected playCards phase, got moveCommanders',
      );
    });

    it('given playCards chooseCards step, still flips cards and jumps to assignInitiative', () => {
      const state = createEmptyGameState();
      const stateWithWrongStep = updatePhaseState(state, {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      const newState = applyRevealCardsEvent(event, stateWithWrongStep);

      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'assignInitiative',
      );
    });

    it('given revealCards step but white awaitingPlay null, throws white awaiting guard', () => {
      const state = createEmptyGameState();
      const stateWithCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          awaitingPlay: commandCards[0],
        },
        white: {
          ...current.white,
          awaitingPlay: null, // No awaiting card
        },
      }));
      const stateWithPhase = updatePhaseState(stateWithCards, {
        phase: PLAY_CARDS_PHASE,
        step: 'revealCards',
      });

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      expect(() => applyRevealCardsEvent(event, stateWithPhase)).toThrow(
        'White player has no card awaiting play',
      );
    });

    it('given revealCards step but black awaitingPlay null, throws black awaiting guard', () => {
      const state = createEmptyGameState();
      const stateWithCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          awaitingPlay: null, // No awaiting card
        },
        white: {
          ...current.white,
          awaitingPlay: commandCards[0],
        },
      }));
      const stateWithPhase = updatePhaseState(stateWithCards, {
        phase: PLAY_CARDS_PHASE,
        step: 'revealCards',
      });

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      expect(() => applyRevealCardsEvent(event, stateWithPhase)).toThrow(
        'Black player has no card awaiting play',
      );
    });
  });

  describe('structural update', () => {
    it('given awaitingPlay refs before apply, input card slots unchanged after apply', () => {
      const state = createGameStateInRevealCardsStep();
      const originalBlackAwaiting = state.cardState.black.awaitingPlay;
      const originalWhiteAwaiting = state.cardState.white.awaitingPlay;

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      applyRevealCardsEvent(event, state);

      // Original state should be unchanged
      expect(state.cardState.black.awaitingPlay).toBe(originalBlackAwaiting);
      expect(state.cardState.white.awaitingPlay).toBe(originalWhiteAwaiting);
      expect(state.cardState.black.inPlay).toBeNull();
      expect(state.cardState.white.inPlay).toBeNull();
    });
  });
});
