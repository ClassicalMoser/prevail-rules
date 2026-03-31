/**
 * createEmptyGameState (testing helper): minimal game state for tests; seeds sample cards in awaitingPlay/inPlay.
 * For full initializer behavior see `transforms/initializations/createEmptyGameState.test.ts`.
 */
import { tempCommandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';
import { createEmptyGameState } from './createEmptyGameState';

describe('createEmptyGameState', () => {
  it('given defaults, returns empty round/board/cards shell', () => {
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

  it('given custom initiative option, sets currentInitiative', () => {
    const gameState = createEmptyGameState({ currentInitiative: 'white' });

    expect(gameState.currentInitiative).toBe('white');
  });

  it('uses fixed sample cards for awaitingPlay and inPlay on both sides', () => {
    const gameState = createEmptyGameState();

    expect(gameState.cardState.black.awaitingPlay).toEqual(tempCommandCards[0]);
    expect(gameState.cardState.black.inPlay).toEqual(tempCommandCards[1]);
    expect(gameState.cardState.white.awaitingPlay).toEqual(tempCommandCards[0]);
    expect(gameState.cardState.white.inPlay).toEqual(tempCommandCards[1]);
  });
});
