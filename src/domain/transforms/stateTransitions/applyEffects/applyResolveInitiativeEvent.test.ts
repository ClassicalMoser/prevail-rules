import type { GameState, StandardBoard } from '@entities';
import type { ResolveInitiativeEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyResolveInitiativeEvent } from './applyResolveInitiativeEvent';

describe('applyResolveInitiativeEvent', () => {
  /**
   * Helper to create a game state in the playCards phase, assignInitiative step
   * with both players having cards in play
   */
  function createGameStateInAssignInitiativeStep(): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inPlay: commandCards[0],
        awaitingPlay: null,
      },
      white: {
        ...current.white,
        inPlay: commandCards[1],
        awaitingPlay: null,
      },
    }));

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'assignInitiative',
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should set currentInitiative to the player from the event', () => {
      const state = createGameStateInAssignInitiativeStep();

      const event: ResolveInitiativeEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveInitiative',
        player: 'black',
      };

      const newState = applyResolveInitiativeEvent(event, state);

      expect(newState.currentInitiative).toBe('black');
    });

    it('should advance step to complete', () => {
      const state = createGameStateInAssignInitiativeStep();

      const event: ResolveInitiativeEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveInitiative',
        player: 'white',
      };

      const newState = applyResolveInitiativeEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'complete',
      );
    });

    it('should work for both players', () => {
      const state = createGameStateInAssignInitiativeStep();

      const blackEvent: ResolveInitiativeEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveInitiative',
        player: 'black',
      };

      const whiteEvent: ResolveInitiativeEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveInitiative',
        player: 'white',
      };

      const stateWithBlack = applyResolveInitiativeEvent(blackEvent, state);
      expect(stateWithBlack.currentInitiative).toBe('black');

      const stateWithWhite = applyResolveInitiativeEvent(whiteEvent, state);
      expect(stateWithWhite.currentInitiative).toBe('white');
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createGameStateInAssignInitiativeStep();
      const originalInitiative = state.currentInitiative;
      const originalStep = state.currentRoundState.currentPhaseState?.step;

      const event: ResolveInitiativeEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveInitiative',
        player: 'black',
      };

      applyResolveInitiativeEvent(event, state);

      expect(state.currentInitiative).toBe(originalInitiative);
      expect(state.currentRoundState.currentPhaseState?.step).toBe(
        originalStep,
      );
    });
  });

  describe('error cases', () => {
    it('should throw if not on assignInitiative step', () => {
      const state = createGameStateInAssignInitiativeStep();
      const stateWithWrongStep = updatePhaseState(state, {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });

      const event: ResolveInitiativeEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveInitiative',
        player: 'black',
      };

      expect(() =>
        applyResolveInitiativeEvent(event, stateWithWrongStep),
      ).toThrow('Play cards phase is not on assignInitiative step');
    });
  });
});
