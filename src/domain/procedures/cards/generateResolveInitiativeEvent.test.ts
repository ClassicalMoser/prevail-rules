import type { GameState, StandardBoard } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateResolveInitiativeEvent } from './generateResolveInitiativeEvent';

/**
 * Play cards, assignInitiative: compare each side’s revealed in-play card `initiative` number.
 * Lower wins the round’s tempo; equal numbers leave `currentInitiative` unchanged.
 */
describe('generateResolveInitiativeEvent', () => {
  /**
   * Both `inPlay` set to the given cards, awaitingPlay cleared, phase step assignInitiative,
   * then `currentInitiative` stamped (defaults black).
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

  describe('winner selection', () => {
    it('given white inPlay lower initiative than black, resolveInitiative.player is white', () => {
      // Sample deck must contain distinct initiative values (1 vs 2).
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

      const event = generateResolveInitiativeEvent(state, 0);

      expect(event.player).toBe('white');
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe('resolveInitiative');
    });

    it('given black inPlay lower initiative than white, resolveInitiative.player is black', () => {
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

      const event = generateResolveInitiativeEvent(state, 0);

      expect(event.player).toBe('black');
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe('resolveInitiative');
    });

    it('given identical initiative on both inPlay cards, keeps currentInitiative player', () => {
      const card = commandCards[0];

      // Tie break: still black when currentInitiative is black
      const stateWithBlack = createGameStateInAssignInitiativeStep(
        card,
        card,
        'black',
      );
      const eventWithBlack = generateResolveInitiativeEvent(stateWithBlack, 0);
      expect(eventWithBlack.player).toBe('black');

      // Tie break: white when currentInitiative is white
      const stateWithWhite = createGameStateInAssignInitiativeStep(
        card,
        card,
        'white',
      );
      const eventWithWhite = generateResolveInitiativeEvent(stateWithWhite, 0);
      expect(eventWithWhite.player).toBe('white');
    });
  });

  describe('preconditions', () => {
    it('given playCards but wrong step, throws assignInitiative guard', () => {
      const state = createEmptyGameState();
      const stateWithWrongStep = updatePhaseState(state, {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });

      expect(() =>
        generateResolveInitiativeEvent(stateWithWrongStep, 0),
      ).toThrow('Play cards phase is not on assignInitiative step');
    });

    it('given white inPlay null at assignInitiative, throws', () => {
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

      expect(() => generateResolveInitiativeEvent(stateWithPhase, 0)).toThrow(
        'White player has no card in play',
      );
    });

    it('given black inPlay null at assignInitiative, throws', () => {
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

      expect(() => generateResolveInitiativeEvent(stateWithPhase, 0)).toThrow(
        'Black player has no card in play',
      );
    });
  });
});
