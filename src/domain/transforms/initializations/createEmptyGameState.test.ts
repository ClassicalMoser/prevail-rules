/**
 * createEmptyGameState (production initializer): full default game state; awaitingPlay/inPlay are null (unlike testing helper).
 */
import { describe, expect, it } from 'vitest';
import { createEmptyGameState } from './createEmptyGameState';

describe('createEmptyGameState', () => {
  it('given defaults, produces empty board and card piles with round scaffolding', () => {
    const gameState = createEmptyGameState();

    expect(gameState.currentRoundNumber).toBe(0);
    expect(gameState.currentRoundState.roundNumber).toBe(1);
    expect(gameState.currentRoundState.completedPhases.size).toBe(0);
    expect(gameState.currentRoundState.currentPhaseState).toBeUndefined();
    expect(gameState.currentRoundState.commandedUnits.size).toBe(0);
    expect(gameState.currentInitiative).toBe('black');
    expect(gameState.boardState.boardType).toBe('standard');
    expect(gameState.cardState.black.inHand).toEqual([]);
    expect(gameState.cardState.black.played).toEqual([]);
    expect(gameState.cardState.black.discarded).toEqual([]);
    expect(gameState.cardState.black.burnt).toEqual([]);
    expect(gameState.cardState.white.inHand).toEqual([]);
    expect(gameState.cardState.white.played).toEqual([]);
    expect(gameState.cardState.white.discarded).toEqual([]);
    expect(gameState.cardState.white.burnt).toEqual([]);
    expect(gameState.routedUnits.size).toBe(0);
  });

  it('given defaults, creates a game state with custom initiative', () => {
    const gameState = createEmptyGameState({ currentInitiative: 'white' });

    expect(gameState.currentInitiative).toBe('white');
  });

  it('initializes awaitingPlay and inPlay to null for both players', () => {
    const gameState = createEmptyGameState();

    expect(gameState.cardState.black.awaitingPlay).toBeNull();
    expect(gameState.cardState.black.inPlay).toBeNull();
    expect(gameState.cardState.white.awaitingPlay).toBeNull();
    expect(gameState.cardState.white.inPlay).toBeNull();
  });

  it('given defaults, creates a game state with a large board size', () => {
    const gameState = createEmptyGameState({ boardSize: 'large' });
    expect(gameState.boardState.boardType).toBe('large');
  });

  it('given defaults, creates a game state with a standard board size', () => {
    const gameState = createEmptyGameState({ boardSize: 'standard' });
    expect(gameState.boardState.boardType).toBe('standard');
  });

  it('given defaults, creates a game state with a small board size', () => {
    const gameState = createEmptyGameState({ boardSize: 'small' });
    expect(gameState.boardState.boardType).toBe('small');
  });
});
