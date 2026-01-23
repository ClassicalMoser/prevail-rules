import type { GameState, StandardBoard } from '@entities';
import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { withCardState, withPhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getExpectedPlayCardsPhaseEvent } from './getExpectedPlayCardsPhaseEvent';

describe('getExpectedPlayCardsPhaseEvent', () => {
  /**
   * Helper to create a game state in the playCards phase with a specific step
   */
  function createGameStateInPlayCardsStep(
    step: 'chooseCards' | 'revealCards' | 'assignInitiative' | 'complete',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithPhase = withPhaseState(state, {
      phase: PLAY_CARDS_PHASE,
      step,
    });

    return stateWithPhase;
  }

  describe('expected events by step', () => {
    describe('chooseCards step', () => {
      it('should return bothPlayers when no cards have been chosen', () => {
        const state = createGameStateInPlayCardsStep('chooseCards');
        // Ensure no cards are awaiting play
        const stateWithNoAwaitingCards = withCardState(state, (current) => ({
          ...current,
          black: { ...current.black, awaitingPlay: null },
          white: { ...current.white, awaitingPlay: null },
        }));

        const expectedEvent = getExpectedPlayCardsPhaseEvent(
          stateWithNoAwaitingCards,
        );

        expect(expectedEvent).toEqual({
          actionType: 'playerChoice',
          playerSource: 'bothPlayers',
          choiceType: 'chooseCard',
        });
      });

      it('should return white player when black has already chosen', () => {
        const state = createGameStateInPlayCardsStep('chooseCards');
        const stateWithBlackCard = withCardState(state, (current) => ({
          ...current,
          black: { ...current.black, awaitingPlay: commandCards[0] },
        }));

        const expectedEvent =
          getExpectedPlayCardsPhaseEvent(stateWithBlackCard);

        expect(expectedEvent).toEqual({
          actionType: 'playerChoice',
          playerSource: 'white',
          choiceType: 'chooseCard',
        });
      });

      it('should return black player when white has already chosen', () => {
        const state = createGameStateInPlayCardsStep('chooseCards');
        // Ensure black has no awaiting card
        const stateWithWhiteCard = withCardState(state, (current) => ({
          ...current,
          black: { ...current.black, awaitingPlay: null },
          white: { ...current.white, awaitingPlay: commandCards[0] },
        }));

        const expectedEvent =
          getExpectedPlayCardsPhaseEvent(stateWithWhiteCard);

        expect(expectedEvent).toEqual({
          actionType: 'playerChoice',
          playerSource: 'black',
          choiceType: 'chooseCard',
        });
      });
    });

    it('should return revealCards gameEffect when step is revealCards', () => {
      const state = createGameStateInPlayCardsStep('revealCards');

      const expectedEvent = getExpectedPlayCardsPhaseEvent(state);

      expect(expectedEvent).toEqual({
        actionType: 'gameEffect',
        effectType: 'revealCards',
      });
    });

    it('should return resolveInitiative gameEffect when step is assignInitiative', () => {
      const state = createGameStateInPlayCardsStep('assignInitiative');

      const expectedEvent = getExpectedPlayCardsPhaseEvent(state);

      expect(expectedEvent).toEqual({
        actionType: 'gameEffect',
        effectType: 'resolveInitiative',
      });
    });

    it('should return completePlayCardsPhase gameEffect when step is complete', () => {
      const state = createGameStateInPlayCardsStep('complete');

      const expectedEvent = getExpectedPlayCardsPhaseEvent(state);

      expect(expectedEvent).toEqual({
        actionType: 'gameEffect',
        effectType: 'completePlayCardsPhase',
      });
    });
  });

  describe('error cases', () => {
    it('should throw if not in playCards phase', () => {
      const state = createEmptyGameState();
      // State has no phase state

      expect(() => getExpectedPlayCardsPhaseEvent(state)).toThrow(
        'No current phase state found',
      );
    });

    it('should throw if in wrong phase', () => {
      const state = createEmptyGameState();
      const stateWithWrongPhase = withPhaseState(state, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'moveFirstCommander',
      });

      expect(() => getExpectedPlayCardsPhaseEvent(stateWithWrongPhase)).toThrow(
        'Expected playCards phase',
      );
    });

    it('should throw for invalid step', () => {
      const state = createGameStateInPlayCardsStep('chooseCards');
      // Bad type cast to test default case
      const stateWithInvalidStep = {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: {
            ...state.currentRoundState.currentPhaseState!,
            step: 'invalidStep' as any,
          },
        },
      };

      expect(() =>
        getExpectedPlayCardsPhaseEvent(stateWithInvalidStep),
      ).toThrow('Invalid playCards phase step: invalidStep');
    });
  });
});
