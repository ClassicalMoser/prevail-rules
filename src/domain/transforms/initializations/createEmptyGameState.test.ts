/**
 * CreateEmptyGameState (production initializer): full default game state; awaitingPlay/inPlay are null (unlike testing helper).
 */

import { createEmptyGameState } from './createEmptyGameState';

describe(createEmptyGameState, () => {
  it('given defaults, produces empty board and card piles with round scaffolding', () => {
    const gameState = createEmptyGameState('standard');

    expect(gameState.currentRoundNumber).toBe(0);
    expect(gameState.currentRoundState.roundNumber).toBe(1);
    expect(gameState.currentRoundState.completedPhases.length).toBe(0);
    expect(gameState.currentRoundState.currentPhaseState).toBe('none');
    expect(gameState.currentRoundState.commandedUnits.length).toBe(0);
    expect(gameState.currentInitiative).toBe('black');
    expect(gameState.boardState.boardType).toBe('standard');
    expect(gameState.cardState.black.inHand).toStrictEqual([]);
    expect(gameState.cardState.black.played).toStrictEqual([]);
    expect(gameState.cardState.black.discarded).toStrictEqual([]);
    expect(gameState.cardState.black.burnt).toStrictEqual([]);
    expect(gameState.cardState.white.inHand).toStrictEqual([]);
    expect(gameState.cardState.white.played).toStrictEqual([]);
    expect(gameState.cardState.white.discarded).toStrictEqual([]);
    expect(gameState.cardState.white.burnt).toStrictEqual([]);
    expect(gameState.routedUnits.length).toBe(0);
  });

  it('initializes awaitingPlay and inPlay to null for both players', () => {
    const gameState = createEmptyGameState('standard');

    expect(gameState.cardState.black.awaitingPlay).toBeNull();
    expect(gameState.cardState.black.inPlay).toBeNull();
    expect(gameState.cardState.white.awaitingPlay).toBeNull();
    expect(gameState.cardState.white.inPlay).toBeNull();
  });

  it('given tutorial game type, creates a game state with a small board size', () => {
    const gameState = createEmptyGameState('tutorial');
    expect(gameState.boardState.boardType).toBe('small');
  });

  it('given standard game type, creates a game state with a standard board size', () => {
    const gameState = createEmptyGameState('standard');
    expect(gameState.boardState.boardType).toBe('standard');
  });

  it('given mini game type, creates a game state with a small board size', () => {
    const gameState = createEmptyGameState('mini');
    expect(gameState.boardState.boardType).toBe('small');
  });
});
