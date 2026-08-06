import type { RevealCardsEvent } from '@events';
import type { GameStateForVisibility } from '@game';
import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@game';

import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfNone } from '@utils';

import { applyRevealCardsEvent } from './applyRevealCardsEvent';

/**
 * After simultaneous picks, `revealCards` promotes both `awaitingPlay` slots to `inPlay` and
 * advances playCards to `assignInitiative`. Guards ensure both sides had a pending card when
 * the step really is revealCards.
 */
describe(applyRevealCardsEvent, () => {
  function createRevealEvent(
    black = tempCommandCards[0],
    white = tempCommandCards[1],
  ): RevealCardsEvent {
    return {
      black,
      effectType: 'revealCards',
      eventNumber: 0,
      eventType: 'gameEffect',
      white,
    };
  }

  /** PlayCards.revealCards with black/white awaitingPlay set and inPlay empty. */
  function createGameStateInRevealCardsStep(): GameStateForVisibility<'authoritative'> {
    const state =
      createEmptyGameState() as GameStateForVisibility<'authoritative'>;

    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        awaitingPlay: tempCommandCards[0],
        inPlay: null,
      },
      white: {
        ...state.cardState.white,
        awaitingPlay: tempCommandCards[1],
        inPlay: null,
      },
    });

    return updatePhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
  }

  describe('authoritative reveal and step', () => {
    it('given both awaitingPlay set, inPlay receives those cards and awaitingPlay clears', () => {
      const state = createGameStateInRevealCardsStep();
      const blackCard = state.cardState.black.awaitingPlay;
      const whiteCard = state.cardState.white.awaitingPlay;

      const newState = applyRevealCardsEvent(createRevealEvent(), state);

      expect(newState.cardState.black.inPlay).toBe(blackCard);
      expect(newState.cardState.black.awaitingPlay).toBeNull();

      expect(newState.cardState.white.inPlay).toBe(whiteCard);
      expect(newState.cardState.white.awaitingPlay).toBeNull();
    });

    it('given revealCards step, next playCards step is assignInitiative', () => {
      const state = createGameStateInRevealCardsStep();

      const newState = applyRevealCardsEvent(createRevealEvent(), state);

      expect(
        throwIfNone(newState.currentRoundState.currentPhaseState, 'phase').step,
      ).toBe('assignInitiative');
    });
  });

  describe('whiteSeen visibility', () => {
    it('reveals owned white from state and black from event payload', () => {
      const base = createGameStateInRevealCardsStep();
      const whiteCard = tempCommandCards[1];
      const state: GameStateForVisibility<'whiteSeen'> = {
        ...base,
        cardState: {
          visibility: 'whiteSeen',
          white: {
            ...base.cardState.white,
            awaitingPlay: whiteCard,
            inPlay: null,
          },
          black: {
            awaitingPlay: 'hidden',
            burnt: [],
            discarded: [],
            inHand: ['hidden'],
            inPlay: null,
            played: [],
          },
        },
      };

      const event = createRevealEvent(tempCommandCards[0], whiteCard);
      const newState = applyRevealCardsEvent(event, state);

      expect(newState.cardState.white.inPlay).toBe(whiteCard);
      expect(newState.cardState.white.awaitingPlay).toBeNull();
      expect(newState.cardState.black.inPlay).toBe(event.black);
      expect(newState.cardState.black.awaitingPlay).toBeNull();
      expect(
        throwIfNone(newState.currentRoundState.currentPhaseState, 'phase').step,
      ).toBe('assignInitiative');
    });
  });

  describe('blackSeen visibility', () => {
    it('reveals owned black from state and white from event payload', () => {
      const base = createGameStateInRevealCardsStep();
      const blackCard = tempCommandCards[0];
      const state: GameStateForVisibility<'blackSeen'> = {
        ...base,
        cardState: {
          visibility: 'blackSeen',
          black: {
            ...base.cardState.black,
            awaitingPlay: blackCard,
            inPlay: null,
          },
          white: {
            awaitingPlay: 'hidden',
            burnt: [],
            discarded: [],
            inHand: ['hidden'],
            inPlay: null,
            played: [],
          },
        },
      };

      const event = createRevealEvent(blackCard, tempCommandCards[1]);
      const newState = applyRevealCardsEvent(event, state);

      expect(newState.cardState.black.inPlay).toBe(blackCard);
      expect(newState.cardState.black.awaitingPlay).toBeNull();
      expect(newState.cardState.white.inPlay).toBe(event.white);
      expect(newState.cardState.white.awaitingPlay).toBeNull();
      expect(
        throwIfNone(newState.currentRoundState.currentPhaseState, 'phase').step,
      ).toBe('assignInitiative');
    });
  });

  describe('guards and mechanical reveal', () => {
    it('given no current phase slice, throws no current phase state', () => {
      const state = createEmptyGameState();

      expect(() => applyRevealCardsEvent(createRevealEvent(), state)).toThrow(
        'No current phase state found',
      );
    });

    it('given moveCommanders phase, throws expected playCards phase', () => {
      const state = createEmptyGameState();
      const stateWithWrongPhase = updatePhaseState(state, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'moveFirstCommander',
      });

      expect(() =>
        applyRevealCardsEvent(createRevealEvent(), stateWithWrongPhase),
      ).toThrow('Expected playCards phase, got moveCommanders');
    });

    it('given playCards chooseCards step, still flips cards and jumps to assignInitiative', () => {
      const state = createEmptyGameState();
      const stateWithWrongStep = updatePhaseState(state, {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });

      const newState = applyRevealCardsEvent(
        createRevealEvent(),
        stateWithWrongStep,
      );

      expect(
        throwIfNone(newState.currentRoundState.currentPhaseState, 'phase').step,
      ).toBe('assignInitiative');
    });

    it('given revealCards step but white awaitingPlay null, throws white awaiting guard', () => {
      const state = createEmptyGameState();
      const stateWithCards = updateCardState(state, {
        ...state.cardState,
        black: {
          ...state.cardState.black,
          awaitingPlay: tempCommandCards[0],
        },
        white: {
          ...state.cardState.white,
          awaitingPlay: null,
        },
      });
      const stateWithPhase = updatePhaseState(stateWithCards, {
        phase: PLAY_CARDS_PHASE,
        step: 'revealCards',
      });

      expect(() =>
        applyRevealCardsEvent(createRevealEvent(), stateWithPhase),
      ).toThrow('Player has no card awaiting play');
    });

    it('given revealCards step but black awaitingPlay null, throws black awaiting guard', () => {
      const state = createEmptyGameState();
      const stateWithCards = updateCardState(state, {
        ...state.cardState,
        black: {
          ...state.cardState.black,
          awaitingPlay: null,
        },
        white: {
          ...state.cardState.white,
          awaitingPlay: tempCommandCards[0],
        },
      });
      const stateWithPhase = updatePhaseState(stateWithCards, {
        phase: PLAY_CARDS_PHASE,
        step: 'revealCards',
      });

      expect(() =>
        applyRevealCardsEvent(createRevealEvent(), stateWithPhase),
      ).toThrow('Player has no card awaiting play');
    });
  });

  describe('structural update', () => {
    it('given awaitingPlay refs before apply, input card slots unchanged after apply', () => {
      const state = createGameStateInRevealCardsStep();
      const originalBlackAwaiting = state.cardState.black.awaitingPlay;
      const originalWhiteAwaiting = state.cardState.white.awaitingPlay;

      applyRevealCardsEvent(createRevealEvent(), state);

      expect(state.cardState.black.awaitingPlay).toBe(originalBlackAwaiting);
      expect(state.cardState.white.awaitingPlay).toBe(originalWhiteAwaiting);
      expect(state.cardState.black.inPlay).toBeNull();
      expect(state.cardState.white.inPlay).toBeNull();
    });
  });
});
