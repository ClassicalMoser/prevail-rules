import type { StandardBoard } from '@entities';
import type { ResolveInitiativeEvent } from '@events';
import type { GameStateForBoard } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfNone } from '@utils';

import { applyResolveInitiativeEvent } from './applyResolveInitiativeEvent';

/**
 * `resolveInitiative` writes `currentInitiative` from the event and finishes the playCards
 * phase (`complete`). Wrong step still applies mechanically (trusted event path).
 */
describe(applyResolveInitiativeEvent, () => {
  /** PlayCards.assignInitiative with both inPlay populated from two command cards. */
  function createGameStateInAssignInitiativeStep(): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        awaitingPlay: null,
        inPlay: tempCommandCards[0],
      },
      white: {
        ...state.cardState.white,
        awaitingPlay: null,
        inPlay: tempCommandCards[1],
      },
    });

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'assignInitiative',
    });

    return stateWithPhase;
  }

  describe('initiative and phase completion', () => {
    it('given event player black, currentInitiative becomes black', () => {
      const state = createGameStateInAssignInitiativeStep();

      const event: ResolveInitiativeEvent = {
        effectType: 'resolveInitiative',
        eventNumber: 0,
        eventType: 'gameEffect',
        player: 'black',
      };

      const newState = applyResolveInitiativeEvent(event, state);

      expect(newState.currentInitiative).toBe('black');
    });

    it('given event player white, playCards step becomes complete', () => {
      const state = createGameStateInAssignInitiativeStep();

      const event: ResolveInitiativeEvent = {
        effectType: 'resolveInitiative',
        eventNumber: 0,
        eventType: 'gameEffect',
        player: 'white',
      };

      const newState = applyResolveInitiativeEvent(event, state);

      expect(
        throwIfNone(newState.currentRoundState.currentPhaseState, 'phase').step,
      ).toBe('complete');
    });

    it('given same base state, black then white events each set initiative without sharing output', () => {
      const state = createGameStateInAssignInitiativeStep();

      const blackEvent: ResolveInitiativeEvent = {
        effectType: 'resolveInitiative',
        eventNumber: 0,
        eventType: 'gameEffect',
        player: 'black',
      };

      const whiteEvent: ResolveInitiativeEvent = {
        effectType: 'resolveInitiative',
        eventNumber: 0,
        eventType: 'gameEffect',
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
      const originalStep = throwIfNone(
        state.currentRoundState.currentPhaseState,
        'phase',
      ).step;

      const event: ResolveInitiativeEvent = {
        effectType: 'resolveInitiative',
        eventNumber: 0,
        eventType: 'gameEffect',
        player: 'black',
      };

      applyResolveInitiativeEvent(event, state);

      expect(state.currentInitiative).toBe(originalInitiative);
      expect(
        throwIfNone(state.currentRoundState.currentPhaseState, 'phase').step,
      ).toBe(originalStep);
    });
  });

  describe('trusted mechanical apply', () => {
    it('given playCards chooseCards step, still sets initiative black and step complete', () => {
      const state = createGameStateInAssignInitiativeStep();
      const stateWithWrongStep = updatePhaseState(state, {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });

      const event: ResolveInitiativeEvent = {
        effectType: 'resolveInitiative',
        eventNumber: 0,
        eventType: 'gameEffect',
        player: 'black',
      };

      const newState = applyResolveInitiativeEvent(event, stateWithWrongStep);

      expect(newState.currentInitiative).toBe('black');
      expect(
        throwIfNone(newState.currentRoundState.currentPhaseState, 'phase').step,
      ).toBe('complete');
    });
  });
});
