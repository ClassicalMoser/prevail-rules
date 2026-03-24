import type { GameState, StandardBoard } from '@entities';
import type { ResolveInitiativeEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyResolveInitiativeEvent } from './applyResolveInitiativeEvent';

/**
 * `resolveInitiative` writes `currentInitiative` from the event and finishes the playCards
 * phase (`complete`). Wrong step still applies mechanically (trusted event path).
 */
describe('applyResolveInitiativeEvent', () => {
  /** playCards.assignInitiative with both inPlay populated from two command cards. */
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

  describe('initiative and phase completion', () => {
    it('given event player black, currentInitiative becomes black', () => {
      const state = createGameStateInAssignInitiativeStep();

      const event: ResolveInitiativeEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'resolveInitiative',
        player: 'black',
      };

      const newState = applyResolveInitiativeEvent(event, state);

      expect(newState.currentInitiative).toBe('black');
    });

    it('given event player white, playCards step becomes complete', () => {
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

    it('given same base state, black then white events each set initiative without sharing output', () => {
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

  describe('structural update', () => {
    it('given initiative and step before apply, input root initiative and step unchanged', () => {
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

  describe('trusted mechanical apply', () => {
    it('given playCards chooseCards step, still sets initiative black and step complete', () => {
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

      const newState = applyResolveInitiativeEvent(event, stateWithWrongStep);

      expect(newState.currentInitiative).toBe('black');
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'complete',
      );
    });
  });
});
