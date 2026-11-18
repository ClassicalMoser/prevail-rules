import type { GameStateChange, GameStateSubscriber } from '@application/ports';
import type { GameEffectEvent } from '@events';
import type { AuthoritativeGameState, Game } from '@game';
import { createInMemoryGameStorage } from '@application/infra';
import { createEmptyGameState } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { recordEvent } from './recordEvent';

const gameId = 'game-1';

/** A stored game holding the given state; its players and armies don't matter here. */
function gameWith(gameState: AuthoritativeGameState): Game {
  const game: Game = {
    blackArmy: blackMiniStarterArmy,
    blackPlayer: '22222222-2222-4222-8222-222222222222',
    events: [],
    gameMode: 'standard',
    gameState,
    id: gameId,
    whiteArmy: whiteMiniStarterArmy,
    whitePlayer: '33333333-3333-4333-8333-333333333333',
  };
  return game;
}

/** A subscriber to this game that keeps every change it is told of. */
function keepingSubscriber(changes: GameStateChange[]): GameStateSubscriber {
  const subscriber: GameStateSubscriber = {
    gameId,
    gameMode: 'standard',
    onError: vi.fn(),
    onGameStateChange: (change) => {
      changes.push(change);
    },
  };
  return subscriber;
}

// The game's ending is an event any stored game can take; which event it is
// does not matter to recording.
const gameOver: GameEffectEvent = {
  effectType: 'gameOver',
  eventType: 'gameEffect',
  winner: 'black',
};

/**
 * Recording is what makes an event part of the game's history; telling the
 * subscribers comes after, and is their concern once the event is recorded.
 */
describe('recordEvent function', () => {
  it('reports a recorded event as recorded when a subscriber throws, and still tells the others', async () => {
    // A stored game, and two subscribers to it: the first fails on every
    // change, the second keeps what it is told.
    const state = createEmptyGameState('standard');
    const storage = createInMemoryGameStorage();
    await storage.saveNewGame(gameWith(state));
    const boom = new Error('socket closed');
    const failing: GameStateSubscriber = {
      gameId,
      gameMode: 'standard',
      onError: vi.fn(),
      onGameStateChange: () => {
        throw boom;
      },
    };
    const changes: GameStateChange[] = [];
    const keeping = keepingSubscriber(changes);

    const result = await recordEvent(
      gameId,
      'standard',
      gameOver,
      state,
      storage,
      [failing, keeping],
    );

    // The event is in the game's stream, so the game has taken it: a caller
    // told otherwise would send it again.
    expect(result).toStrictEqual({ data: undefined, result: true });
    await expect(storage.getGame(gameId, 'standard')).resolves.toMatchObject({
      data: { events: [gameOver] },
      result: true,
    });

    // The failing subscriber hears of its own failure, and the one after it
    // is still told of the change.
    expect(failing.onError).toHaveBeenCalledWith(boom);
    expect(changes).toHaveLength(1);
  });

  it('tells no subscriber when the storage refuses the event', async () => {
    // Nothing was saved, so there is no game to record on.
    const state = createEmptyGameState('standard');
    const storage = createInMemoryGameStorage();
    const changes: GameStateChange[] = [];

    const result = await recordEvent(
      gameId,
      'standard',
      gameOver,
      state,
      storage,
      [keepingSubscriber(changes)],
    );

    // The storage's refusal is the answer, and nothing changed to announce.
    expect(result).toStrictEqual({
      errorReason: 'Game game-1 not found',
      result: false,
    });
    expect(changes).toStrictEqual([]);
  });
});
