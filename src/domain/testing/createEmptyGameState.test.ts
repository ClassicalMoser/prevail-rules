/**
 * CreateEmptyGameState (testing helper): minimal game state for tests; seeds sample cards in awaitingPlay/inPlay.
 * For full initializer behavior see `transforms/initializations/createEmptyGameState.test.ts`.
 */
import { tempCommandCards } from '@sampleValues';

import { createEmptyGameState } from './createEmptyGameState';

describe(createEmptyGameState, () => {
  it('given defaults, returns empty round/board/cards shell', () => {
    const gameState = createEmptyGameState();

    expect(gameState.currentRoundNumber).toBe(0);
    expect(gameState.currentRoundState.roundNumber).toBe(1);
    expect(gameState.currentRoundState.completedPhases.length).toBe(0);
    expect(gameState.currentRoundState.currentPhaseState).toBeUndefined();
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

  it('given custom initiative option, sets currentInitiative', () => {
    const gameState = createEmptyGameState({ currentInitiative: 'white' });

    expect(gameState.currentInitiative).toBe('white');
  });

  it('uses fixed sample cards for awaitingPlay and inPlay on both sides', () => {
    const gameState = createEmptyGameState();

    expect(gameState.cardState.black.awaitingPlay).toStrictEqual(
      tempCommandCards[0],
    );
    expect(gameState.cardState.black.inPlay).toStrictEqual(tempCommandCards[1]);
    expect(gameState.cardState.white.awaitingPlay).toStrictEqual(
      tempCommandCards[0],
    );
    expect(gameState.cardState.white.inPlay).toStrictEqual(tempCommandCards[1]);
  });
});
