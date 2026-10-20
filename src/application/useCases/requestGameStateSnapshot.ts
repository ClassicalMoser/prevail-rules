import type { GameModeName, PlayerSide } from '@entities';
import type { Game, GameForVisibility, GameStateVisibility } from '@game';
import { isAuthoritativeGameState } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { getGame } from '@application/composable';
import { projectGameForVisibility } from '@transforms';

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
 * Loads the current authoritative game and returns a projected snapshot
 * for client reconcile (refresh / missed updates / broken local view).
 *
 * Board units are never redacted. A seat hides the opponent card slice.
 * A spectator hides both hands and both awaiting-play cards.
 */
export async function requestGameStateSnapshot(
  gameId: string,
  gameMode: GameModeName,
  viewer: PlayerSide | 'spectator',
  ports: EnginePorts,
): Promise<PortResponse<Game>> {
  const game = await getGame(gameId, gameMode, ports.gameStorage);
  if (!game) {
    return {
      errorReason: 'Game not found',
      result: false,
    };
  }

  if (!isAuthoritativeGameState(game.gameState)) {
    return {
      errorReason: 'Engine requires authoritative game state',
      result: false,
    };
  }

  const authoritative = game as GameForVisibility<'authoritative'>;
  const visibility = visibilityForViewer(viewer);
  const projected = projectGameForVisibility(authoritative, visibility);

  return {
    data: projected,
    result: true,
  };
}
