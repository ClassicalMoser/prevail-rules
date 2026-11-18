import type { GameEffectEvent } from '@events';
import type { Game } from '@game';
import { createInitialGameState } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { projectGameStateForVisibility } from '@transforms';
import { createInMemoryGameStorage } from './createInMemoryGameStorage';

/** A new mini game, as `startNewGame` would store it. */
const game: Game = {
  blackArmy: blackMiniStarterArmy,
  blackPlayer: '22222222-2222-4222-8222-222222222222',
  events: [],
  gameMode: 'mini',
  gameState: createInitialGameState({
    blackArmy: blackMiniStarterArmy,
    gameMode: 'mini',
    whiteArmy: whiteMiniStarterArmy,
  }),
  id: '11111111-1111-4111-8111-111111111111',
  whiteArmy: whiteMiniStarterArmy,
  whitePlayer: '33333333-3333-4333-8333-333333333333',
};

/**
 * Games are kept by id. A saved game can be read back, and its state moved on;
 * an unknown game answers none.
 */
/** The ending of a game, Black prevailing: an event to record. */
const ending: GameEffectEvent = {
  effectType: 'gameOver',
  eventType: 'gameEffect',
  winner: 'black',
};

describe('createInMemoryGameStorage function', () => {
  it('answers no game for an id it has never stored', async () => {
    const storage = createInMemoryGameStorage();

    // The composables read an answer with no game as "not found".
    await expect(storage.getGame(game.id, 'mini')).resolves.toStrictEqual({
      data: undefined,
      result: true,
    });
  });

  it('reads back a saved game', async () => {
    const storage = createInMemoryGameStorage();
    await storage.saveNewGame(game);

    // The same game comes back, players and armies included.
    await expect(storage.getGame(game.id, 'mini')).resolves.toStrictEqual({
      data: game,
      result: true,
    });
  });

  it("records an event: it joins the game's stream, and the state moves on", async () => {
    const storage = createInMemoryGameStorage();
    await storage.saveNewGame(game);

    // The game ends with Black prevailing; the state is the one that led to.
    const ended = { ...game.gameState, winner: 'black' as const };
    await expect(
      storage.recordEvent(game.id, ending, ended),
    ).resolves.toStrictEqual({
      data: undefined,
      result: true,
    });

    // The same game, its players and armies kept, now ends its stream with
    // the ending and holds the state it led to.
    await expect(storage.getGame(game.id, 'mini')).resolves.toStrictEqual({
      data: { ...game, events: [ending], gameState: ended },
      result: true,
    });
  });

  it('refuses to record on a game it does not hold', async () => {
    const storage = createInMemoryGameStorage();

    // Nothing was saved, so there is no game to move on.
    await expect(
      storage.recordEvent(game.id, ending, game.gameState),
    ).resolves.toStrictEqual({
      errorReason: `Game ${game.id} not found`,
      result: false,
    });
  });

  it("refuses a seat's view in place of the full state", async () => {
    const storage = createInMemoryGameStorage();
    await storage.saveNewGame(game);

    // White's view hides Black's hand, so it cannot be the stored record.
    const whiteView = projectGameStateForVisibility(
      game.gameState,
      'whiteSeen',
    );
    await expect(
      storage.recordEvent(game.id, ending, whiteView),
    ).resolves.toStrictEqual({
      errorReason: `Game ${game.id} stores only its full state, not a whiteSeen view`,
      result: false,
    });
  });
});
