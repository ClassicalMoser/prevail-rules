import type { Game } from '@game';
import { createInitialGameState } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { projectGameStateForVisibility } from '@transforms';
import { createInMemoryGameStorage } from './createInMemoryGameStorage';

/** A new mini game, as `startNewGame` would store it. */
const game: Game = {
  blackArmy: blackMiniStarterArmy,
  blackPlayer: '22222222-2222-4222-8222-222222222222',
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

  it("replaces a stored game's state and keeps the rest of the game", async () => {
    const storage = createInMemoryGameStorage();
    await storage.saveNewGame(game);

    // White has the initiative going into the first round.
    const moved = { ...game.gameState, currentInitiative: 'black' as const };
    await expect(
      storage.updateGameState(game.id, moved),
    ).resolves.toStrictEqual({
      data: undefined,
      result: true,
    });

    // The new state is stored under the same game.
    await expect(storage.getGame(game.id, 'mini')).resolves.toStrictEqual({
      data: { ...game, gameState: moved },
      result: true,
    });
  });

  it('refuses to update a game it does not hold', async () => {
    const storage = createInMemoryGameStorage();

    // Nothing was saved, so there is no game to move on.
    await expect(
      storage.updateGameState(game.id, game.gameState),
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
      storage.updateGameState(game.id, whiteView),
    ).resolves.toStrictEqual({
      errorReason: `Game ${game.id} stores only its full state, not a whiteSeen view`,
      result: false,
    });
  });
});
