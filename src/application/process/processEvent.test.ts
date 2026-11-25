import type { EnginePorts } from '@application/ports';
import type { GameEffectEvent } from '@events';
import type { AuthoritativeGameState, Game } from '@game';
import { createInMemoryEnginePorts } from '@application/infra';
import { createEmptyGameState } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { processEvent } from './processEvent';

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

/** In-memory ports already holding a game in the given state. */
async function portsHolding(
  state: AuthoritativeGameState,
): Promise<EnginePorts> {
  const ports = createInMemoryEnginePorts();
  await ports.gameStorage.saveNewGame(gameWith(state));

  // The game is stored, and nothing else has happened.
  return ports;
}

/**
 * A game's record is its event stream, and the stream is the game's history:
 * it holds the events that happened. An event the game could not take is not
 * part of that history, so it is applied first and recorded only once it has
 * been.
 */
describe('processEvent function', () => {
  it('records nothing when the event cannot be applied', async () => {
    // A game at setup, its stream empty.
    const state = createEmptyGameState('standard');
    const ports = await portsHolding(state);

    // Played cards are put aside at cleanup, and setup has no phase yet, so
    // the game cannot take this.
    const putAside: GameEffectEvent = {
      effectType: 'cardsLeavePlay',
      eventType: 'gameEffect',
    };
    await expect(
      processEvent(gameId, 'standard', putAside, state, ports),
    ).rejects.toThrow('No current phase state found');

    // The stored game, its stream included, is as it was: the stream never
    // learns of an event the game never took.
    await expect(
      ports.gameStorage.getGame(gameId, 'standard'),
    ).resolves.toStrictEqual({ data: gameWith(state), result: true });
  });

  it('refuses when the game it would record on is not stored', async () => {
    // Nothing was saved, so there is no game to record on.
    const state = createEmptyGameState('standard');
    const ports = createInMemoryEnginePorts();

    // White's hand is empty, so the game can take its ending.
    const gameOver: GameEffectEvent = {
      effectType: 'gameOver',
      eventType: 'gameEffect',
      winner: 'black',
    };
    const result = await processEvent(
      gameId,
      'standard',
      gameOver,
      state,
      ports,
    );

    // The storage's refusal comes back as the answer.
    expect(result).toStrictEqual({
      errorReason: 'Game game-1 not found',
      failure: 'storage',
      result: false,
    });
  });

  it("records the event in the game's stream, with the state it led to", async () => {
    // White's hand is empty, so the game can take its ending.
    const state = createEmptyGameState('standard');
    const ports = await portsHolding(state);
    const gameOver: GameEffectEvent = {
      effectType: 'gameOver',
      eventType: 'gameEffect',
      winner: 'black',
    };

    await processEvent(gameId, 'standard', gameOver, state, ports);

    // The stored game's stream ends with the ending, and its state is the
    // one that ending led to: Black has prevailed.
    await expect(
      ports.gameStorage.getGame(gameId, 'standard'),
    ).resolves.toMatchObject({
      data: { events: [gameOver], gameState: { winner: 'black' } },
      result: true,
    });
  });
});
