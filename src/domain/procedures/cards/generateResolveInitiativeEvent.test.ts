import type { GameState, StandardBoard } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateResolveInitiativeEvent } from './generateResolveInitiativeEvent';

describe('generateResolveInitiativeEvent', () => {
  /**
   * Helper to create a game state in the playCards phase, assignInitiative step
   * with both players having cards in play
   */
  function createGameStateInAssignInitiativeStep(
    whiteCard: (typeof commandCards)[number],
    blackCard: (typeof commandCards)[number],
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inPlay: blackCard,
        awaitingPlay: null,
      },
      white: {
        ...current.white,
        inPlay: whiteCard,
        awaitingPlay: null,
      },
    }));

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'assignInitiative',
    });

    const stateWithInitiative = {
      ...stateWithPhase,
      currentInitiative,
    };

    return stateWithInitiative;
  }

  describe('basic functionality', () => {
    it('should return white player when white has lower initiative', () => {
      // Find cards with different initiative values
      const whiteCard = commandCards.find((c) => c.initiative === 1);
      const blackCard = commandCards.find((c) => c.initiative === 2);

      if (!whiteCard || !blackCard) {
        throw new Error(
          'Could not find cards with different initiative values',
        );
      }

      const state = createGameStateInAssignInitiativeStep(
        whiteCard,
        blackCard,
        'black',
      );

      const event = generateResolveInitiativeEvent(state);

      expect(event.player).toBe('white');
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe('resolveInitiative');
    });

    it('should return black player when black has lower initiative', () => {
      const whiteCard = commandCards.find((c) => c.initiative === 2);
      const blackCard = commandCards.find((c) => c.initiative === 1);

      if (!whiteCard || !blackCard) {
        throw new Error(
          'Could not find cards with different initiative values',
        );
      }

      const state = createGameStateInAssignInitiativeStep(
        whiteCard,
        blackCard,
        'white',
      );

      const event = generateResolveInitiativeEvent(state);

      expect(event.player).toBe('black');
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe('resolveInitiative');
    });

    it('should return current initiative holder on tie', () => {
      // Use the same card for both players to create a tie
      const card = commandCards[0];

      // Test with black as current holder
      const stateWithBlack = createGameStateInAssignInitiativeStep(
        card,
        card,
        'black',
      );
      const eventWithBlack = generateResolveInitiativeEvent(stateWithBlack);
      expect(eventWithBlack.player).toBe('black');

      // Test with white as current holder
      const stateWithWhite = createGameStateInAssignInitiativeStep(
        card,
        card,
        'white',
      );
      const eventWithWhite = generateResolveInitiativeEvent(stateWithWhite);
      expect(eventWithWhite.player).toBe('white');
    });
  });

  describe('error cases', () => {
    it('should throw if not on assignInitiative step', () => {
      const state = createEmptyGameState();
      const stateWithWrongStep = updatePhaseState(state, {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });

      expect(() => generateResolveInitiativeEvent(stateWithWrongStep)).toThrow(
        'Play cards phase is not on assignInitiative step',
      );
    });

    it('should throw if white player has no card in play', () => {
      const blackCard = commandCards[0];
      const state = createEmptyGameState();

      const stateWithCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          inPlay: blackCard,
          awaitingPlay: null,
        },
        white: {
          ...current.white,
          inPlay: null,
          awaitingPlay: null,
        },
      }));

      const stateWithPhase = updatePhaseState(stateWithCards, {
        phase: PLAY_CARDS_PHASE,
        step: 'assignInitiative',
      });

      expect(() => generateResolveInitiativeEvent(stateWithPhase)).toThrow(
        'White player has no card in play',
      );
    });

    it('should throw if black player has no card in play', () => {
      const whiteCard = commandCards[0];
      const state = createEmptyGameState();

      const stateWithCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          inPlay: null,
          awaitingPlay: null,
        },
        white: {
          ...current.white,
          inPlay: whiteCard,
          awaitingPlay: null,
        },
      }));

      const stateWithPhase = updatePhaseState(stateWithCards, {
        phase: PLAY_CARDS_PHASE,
        step: 'assignInitiative',
      });

      expect(() => generateResolveInitiativeEvent(stateWithPhase)).toThrow(
        'Black player has no card in play',
      );
    });
  });
});
