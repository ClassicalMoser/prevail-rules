import { createEmptyGameState } from './createEmptyGameState';

/**
 * Empty game state maps each catalog mode onto a board size and otherwise blank scaffolding.
 * Tutorial and mini share the small board. Standard and epic use their own sizes.
 * A value outside GameModeName is rejected so a drifted catalog fails at runtime.
 */

describe('createEmptyGameState function', () => {
  it('starts white on a standard board with empty piles and no phase', () => {
    const gameState = createEmptyGameState('standard');

    // Setup is round 0; the first round to be played is 1.
    expect(gameState.currentRoundState.roundNumber).toBe(0);
    expect(gameState.currentRoundState.completedPhases).toStrictEqual([]);
    expect(gameState.currentRoundState.currentPhaseState).toBe('none');
    expect(gameState.currentRoundState.commandedUnits).toStrictEqual([]);
    // White holds the initiative going into round one (§3.3.2).
    expect(gameState.currentInitiative).toBe('white');
    expect(gameState.boardState.boardType).toBe('standard');
    // The engine's own view, before any card has been dealt to either side.
    expect(gameState.cardState.visibility).toBe('authoritative');
    expect(gameState.cardState.black.inHand).toStrictEqual([]);
    expect(gameState.cardState.black.played).toStrictEqual([]);
    expect(gameState.cardState.black.discarded).toStrictEqual([]);
    expect(gameState.cardState.black.burnt).toStrictEqual([]);
    expect(gameState.cardState.black.awaitingPlay).toBeNull();
    expect(gameState.cardState.black.inPlay).toBeNull();
    expect(gameState.cardState.white.inHand).toStrictEqual([]);
    expect(gameState.cardState.white.played).toStrictEqual([]);
    expect(gameState.cardState.white.discarded).toStrictEqual([]);
    expect(gameState.cardState.white.burnt).toStrictEqual([]);
    expect(gameState.cardState.white.awaitingPlay).toBeNull();
    expect(gameState.cardState.white.inPlay).toBeNull();
    // No army has been mustered: no unit waits in reserve or has routed, and
    // no commander is lost.
    expect(gameState.reservedUnits).toStrictEqual([]);
    expect(gameState.routedUnits).toStrictEqual([]);
    expect(gameState.lostCommanders).toStrictEqual([]);
  });

  // Tutorial and mini both select the small board.
  it('uses the small board for tutorial', () => {
    expect(createEmptyGameState('tutorial').boardState.boardType).toBe('small');
  });

  it('uses the small board for mini', () => {
    expect(createEmptyGameState('mini').boardState.boardType).toBe('small');
  });

  // Epic selects the large board.
  it('uses the large board for epic', () => {
    expect(createEmptyGameState('epic').boardState.boardType).toBe('large');
  });

  it('rejects a mode outside the catalog', () => {
    // Intentional invalid mode so the exhaustive default stays aligned at runtime.
    const mode = 'skirmish' as never;

    expect(() => createEmptyGameState(mode)).toThrow(
      'Unknown gameMode: skirmish',
    );
  });
});
