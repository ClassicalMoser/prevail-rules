import type { GameState, StandardBoard } from '@entities';
import { describe, expect, it } from 'vitest';
import { createEmptyGameState } from './createEmptyGameState';

describe('createEmptyGameState', () => {
  it('should create an empty game state with default values', () => {
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

  it('should create a game state with custom initiative', () => {
    const gameState = createEmptyGameState({ currentInitiative: 'white' });

    expect(gameState.currentInitiative).toBe('white');
  });

  it('should have awaitingPlay and inPlay cards set', () => {
    const gameState = createEmptyGameState();

    expect(gameState.cardState.black.awaitingPlay).toBeDefined();
    expect(gameState.cardState.black.inPlay).toBeDefined();
    expect(gameState.cardState.white.awaitingPlay).toBeDefined();
    expect(gameState.cardState.white.inPlay).toBeDefined();
  });

  it('should return a valid GameState type', () => {
    const gameState = createEmptyGameState();

    // Type check: should be assignable to GameState<StandardBoard>
    const _typeCheck: GameState<StandardBoard> = gameState;
    expect(_typeCheck).toBe(gameState);
  });
});
