import type { GameState, OwnedPlayerForGameState } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { applyEvent } from '@transforms';
import { recordEvent } from '@application/composable';
import type { GameEffectEvent, PlayerChoiceEvent } from '@events';
import type { GameModeName } from '@entities';

export async function processEvent<S extends GameState>(
  gameId: string,
  gameMode: GameModeName,
  event:
    | GameEffectEvent
    | (PlayerChoiceEvent & { player: OwnedPlayerForGameState<S> }),
  gameState: S,
  ports: EnginePorts,
): Promise<PortResponse<S>> {
  // The event is applied first: the stream is the game's history, so it
  // records only events the game has actually taken. An event that cannot be
  // applied throws here and leaves the stream as it was.
  const newGameState = applyEvent(event, gameState);

  // The event joins the game's stream with the state it led to, together, and
  // the game's subscribers are told.
  const recorded = await recordEvent(
    gameId,
    gameMode,
    event,
    newGameState,
    ports.gameStorage,
    ports.gameStateSubscribers,
  );
  if (!recorded.result) {
    return {
      errorReason: recorded.errorReason,
      result: false,
    };
  }

  // If everything succeeded, return the new game state
  return {
    data: newGameState,
    result: true,
  };
}
