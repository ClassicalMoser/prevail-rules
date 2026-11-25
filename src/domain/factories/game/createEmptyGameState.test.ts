import { createEmptyGameState } from './createEmptyGameState';

/**
 * The game before anyone has mustered: setup has not begun, White holds the
 * initiative, no card has been dealt and no piece placed. The mode decides
 * only which board it is played on.
 */
describe('createEmptyGameState function', () => {
  // Any mode will do for the facts that do not depend on the board.
  const gameState = createEmptyGameState('standard');

  it('begins at setup, round 0, with no phase under way', () => {
    // Setup is round 0, with its own events; nothing has been played yet, so
    // no phase is done, none is under way, and no unit has been ordered.
    expect(gameState.currentRoundState).toStrictEqual({
      commandedUnits: [],
      completedPhases: [],
      currentPhaseState: 'none',
      roundNumber: 0,
    });
  });

  it('gives White the initiative', () => {
    // White holds the initiative going into round one, and so sets up first
    // (§3.3.2).
    expect(gameState.currentInitiative).toBe('white');
  });

  it('holds no card on either side, in the engine’s own full view', () => {
    // Every pile empty and nothing chosen or in play.
    const empty = {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: [],
      inPlay: null,
      played: [],
    };

    // The engine creates the full record; a seat's view is projected from it.
    expect(gameState.cardState).toStrictEqual({
      black: empty,
      visibility: 'authoritative',
      white: empty,
    });
  });

  it('has no piece anywhere yet', () => {
    // No army has been brought, so nothing waits in reserve or has routed.
    expect(gameState.reservedUnits).toStrictEqual([]);
    expect(gameState.routedUnits).toStrictEqual([]);

    // Both commanders wait to be placed at setup, and none is lost.
    expect(gameState.index).toStrictEqual({
      commanders: { black: 'reserved', white: 'reserved' },
      units: {},
    });
    expect(gameState.lostCommanders).toStrictEqual([]);
  });

  it('has nobody winning yet', () => {
    // The game has not begun, so it cannot be over.
    expect(gameState.winner).toBe('pending');
  });

  it('lays out the board the mode is played on', () => {
    // Standard has its own board; tutorial and mini share the small one; epic
    // is played on the large one.
    expect(createEmptyGameState('standard').boardState.boardType).toBe(
      'standard',
    );
    expect(createEmptyGameState('tutorial').boardState.boardType).toBe('small');
    expect(createEmptyGameState('mini').boardState.boardType).toBe('small');
    expect(createEmptyGameState('epic').boardState.boardType).toBe('large');
  });

  it('rejects a mode outside the catalog', () => {
    // A mode name enters a game here, so one the catalog lacks is refused
    // here. The type forbids it, so the spec has to force it through.
    const mode = 'skirmish' as never;

    expect(() => createEmptyGameState(mode)).toThrow(
      'Unknown gameMode: skirmish',
    );
  });
});
