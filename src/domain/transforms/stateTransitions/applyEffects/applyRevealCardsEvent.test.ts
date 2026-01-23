import type { GameState, StandardBoard } from '@entities';
import type { RevealCardsEvent } from '@events';
import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { withCardState, withPhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyRevealCardsEvent } from './applyRevealCardsEvent';

describe('applyRevealCardsEvent', () => {
  /**
   * Helper to create a game state in the playCards phase, revealCards step
   * with both players having cards awaiting play
   */
  function createGameStateInRevealCardsStep(): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithCards = withCardState(state, (current) => ({
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

    const stateWithPhase = withPhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should move both players cards from awaitingPlay to inPlay', () => {
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

    it('should advance step to assignInitiative', () => {
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

  describe('error cases', () => {
    it('should throw if no phase state exists', () => {
      const state = createEmptyGameState();

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      expect(() => applyRevealCardsEvent(event, state)).toThrow(
        'No current phase state found',
      );
    });

    it('should throw if not in playCards phase', () => {
      const state = createEmptyGameState();
      const stateWithWrongPhase = withPhaseState(state, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'moveFirstCommander',
      });

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      expect(() => applyRevealCardsEvent(event, stateWithWrongPhase)).toThrow(
        'Expected playCards phase',
      );
    });

    it('should throw if not on revealCards step', () => {
      const state = createEmptyGameState();
      const stateWithWrongStep = withPhaseState(state, {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards', // Wrong step
      });

      const event: RevealCardsEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'revealCards',
      };

      expect(() => applyRevealCardsEvent(event, stateWithWrongStep)).toThrow(
        'Play cards phase is not on revealCards step',
      );
    });

    it('should throw if white player has no awaiting card', () => {
      const state = createEmptyGameState();
      const stateWithCards = withCardState(state, (current) => ({
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
      const stateWithPhase = withPhaseState(stateWithCards, {
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

    it('should throw if black player has no awaiting card', () => {
      const state = createEmptyGameState();
      const stateWithCards = withCardState(state, (current) => ({
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
      const stateWithPhase = withPhaseState(stateWithCards, {
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

  describe('immutability', () => {
    it('should not mutate the original state', () => {
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
