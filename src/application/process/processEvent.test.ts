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
    // A game at setup, its round's stream open and empty.
    const state = createEmptyGameState('standard');
    const ports = await portsHolding(state);
    await ports.eventStreamStorage.newEventStream(gameId, 0);

    // Played cards are put aside at cleanup, and setup has no phase yet, so
    // the game cannot take this.
    const putAside: GameEffectEvent = {
      effectType: 'discardPlayedCards',
      eventType: 'gameEffect',
    };
    await expect(
      processEvent(gameId, 'standard', putAside, state, ports),
    ).rejects.toThrow('No current phase state found');

    // The stream never learns of an event the game never took.
    await expect(
      ports.eventStreamStorage.getEventStream(gameId, 0),
    ).resolves.toStrictEqual({ data: [], result: true });

    // And the stored game is as it was.
    await expect(
      ports.gameStorage.getGame(gameId, 'standard'),
    ).resolves.toStrictEqual({ data: gameWith(state), result: true });
  });

  it('refuses, and keeps the stored game as it was, when the event cannot be recorded', async () => {
    // A game whose round has no open stream, so nothing can be recorded.
    const state = createEmptyGameState('standard');
    const ports = await portsHolding(state);

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

    // The stream's refusal comes back as the answer.
    expect(result).toStrictEqual({
      errorReason: 'No event stream for game game-1, round 0',
      result: false,
    });

    // The game is not stored ahead of its own history.
    await expect(
      ports.gameStorage.getGame(gameId, 'standard'),
    ).resolves.toStrictEqual({ data: gameWith(state), result: true });
  });
});
