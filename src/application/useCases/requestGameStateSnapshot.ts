import type { GameModeName, PlayerSide } from '@entities';
import type { GameState, GameStateVisibility } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { getGame } from '@application/composable';
import { projectGameStateForVisibility } from '@transforms';

/**
 * Maps a reconcile viewer to the card visibility they are allowed to read.
 * A seat sees its own hand. A spectator sees neither.
 */
function visibilityForViewer(
  viewer: PlayerSide | 'spectator',
): Exclude<GameStateVisibility, 'authoritative'> {
  switch (viewer) {
    case 'white': {
      // The white seat keeps its own hand.
      const visibility = 'whiteSeen';
      return visibility;
    }
    case 'black': {
      // The black seat keeps its own hand.
      const visibility = 'blackSeen';
      return visibility;
    }
    case 'spectator': {
      // A spectator keeps neither hand.
      const visibility = 'spectator';
      return visibility;
    }
    default: {
      const _exhaustive: never = viewer;
      throw new Error(`Invalid viewer: ${_exhaustive}`);
    }
  }
}

/**
 * Loads the current authoritative game and returns its state projected for
 * one viewer, for client reconcile (refresh / missed updates / broken local
 * view). A client gets the game state it may see, not the server's game record.
 *
 * Board units are never redacted. A seat hides the opponent card slice.
 * A spectator hides both hands and both awaiting-play cards.
 */
export async function requestGameStateSnapshot(
  gameId: string,
  gameMode: GameModeName,
  viewer: PlayerSide | 'spectator',
  ports: EnginePorts,
): Promise<PortResponse<GameState>> {
  const game = await getGame(gameId, gameMode, ports.gameStorage);
  if (!game.result) {
    return game;
  }

  const visibility = visibilityForViewer(viewer);
  const projected = projectGameStateForVisibility(
    game.data.gameState,
    visibility,
  );

  return {
    data: projected,
    result: true,
  };
}
