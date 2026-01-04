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
    expect(gameState.cardState.blackPlayer.inHand).toEqual([]);
    expect(gameState.cardState.blackPlayer.played).toEqual([]);
    expect(gameState.cardState.blackPlayer.discarded).toEqual([]);
    expect(gameState.cardState.blackPlayer.burnt).toEqual([]);
    expect(gameState.cardState.whitePlayer.inHand).toEqual([]);
    expect(gameState.cardState.whitePlayer.played).toEqual([]);
    expect(gameState.cardState.whitePlayer.discarded).toEqual([]);
    expect(gameState.cardState.whitePlayer.burnt).toEqual([]);
    expect(gameState.routedUnits.size).toBe(0);
  });

  it('should create a game state with custom initiative', () => {
    const gameState = createEmptyGameState({ currentInitiative: 'white' });

    expect(gameState.currentInitiative).toBe('white');
  });

  it('should have awaitingPlay and inPlay cards set', () => {
    const gameState = createEmptyGameState();

    expect(gameState.cardState.blackPlayer.awaitingPlay).toBeDefined();
    expect(gameState.cardState.blackPlayer.inPlay).toBeDefined();
    expect(gameState.cardState.whitePlayer.awaitingPlay).toBeDefined();
    expect(gameState.cardState.whitePlayer.inPlay).toBeDefined();
  });

  it('should return a valid GameState type', () => {
    const gameState = createEmptyGameState();

    // Type check: should be assignable to GameState<StandardBoard>
    const _typeCheck: GameState<StandardBoard> = gameState;
    expect(_typeCheck).toBe(gameState);
  });
});
