import { createEmptyGameState, createPlayCardsPhaseState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getPlayersAwaitingCardChoice } from './getPlayersAwaitingCardChoice';

describe('getPlayersAwaitingCardChoice', () => {
  it('should return bothPlayers when neither has chosen', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState({
      step: 'chooseCards',
    });
    state.cardState.black.awaitingPlay = null;
    state.cardState.white.awaitingPlay = null;

    expect(getPlayersAwaitingCardChoice(state)).toBe('bothPlayers');
  });

  it('should return white when black has already chosen', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState({
      step: 'chooseCards',
    });
    // black has chosen (awaitingPlay is set), white hasn't
    state.cardState.white.awaitingPlay = null;

    expect(getPlayersAwaitingCardChoice(state)).toBe('white');
  });

  it('should return black when white has already chosen', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState({
      step: 'chooseCards',
    });
    // white has chosen, black hasn't
    state.cardState.black.awaitingPlay = null;

    expect(getPlayersAwaitingCardChoice(state)).toBe('black');
  });

  it('should throw when both have already chosen', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState({
      step: 'chooseCards',
    });
    // Both have chosen (awaitingPlay is set for both by default in createEmptyGameState)

    expect(() => getPlayersAwaitingCardChoice(state)).toThrow(
      'Both players have already chosen cards',
    );
  });

  it('should throw when not in chooseCards step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState({
      step: 'revealCards',
    });

    expect(() => getPlayersAwaitingCardChoice(state)).toThrow(
      'Expected chooseCards step, got revealCards',
    );
  });
});
