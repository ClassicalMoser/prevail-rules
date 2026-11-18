import type { Game, GameStateVisibility, ProjectedGame } from '@game';

import { createInitialGameState } from '@factories';
import { projectBlackSeenGameState } from './projectBlackSeenGameState';
import { projectEventForVisibility } from './projectEventForVisibility';
import { projectSpectatorGameState } from './projectSpectatorGameState';
import { projectWhiteSeenGameState } from './projectWhiteSeenGameState';

/**
 * The game as one viewer may see it, for a client joining or resyncing.
 *
 * The armies are not sent, since each lists its side's command cards, and
 * those are a hand only its own seat may read (hands are secret, §1.4). The viewer gets the
 * state the game opened on instead, and the game's events, both in its view:
 * replaying the one from the other gives every state that viewer has seen.
 * The current state comes along so the client need not replay to draw it.
 *
 * @param game - The game as the server keeps it
 * @param visibility - What the viewer may see
 * @returns The game in that viewer's view
 */
export function projectGameForVisibility(
  game: Game,
  visibility: GameStateVisibility,
): ProjectedGame {
  // The opening state is not stored: it is rebuilt from the armies the way
  // `startNewGame` built it, units in reserve and each hand dealt.
  const openingState = createInitialGameState({
    blackArmy: game.blackArmy,
    gameMode: game.gameMode,
    whiteArmy: game.whiteArmy,
  });

  // Who plays, in which game and mode, is public to every view.
  const { blackPlayer, gameMode, id, whitePlayer } = game;

  switch (visibility) {
    case 'authoritative': {
      // Every card is in view, so nothing is turned face down.
      const authoritative: ProjectedGame = {
        blackPlayer,
        events: game.events,
        gameMode,
        gameState: game.gameState,
        id,
        openingState,
        visibility,
        whitePlayer,
      };
      return authoritative;
    }
    case 'whiteSeen': {
      // White's seat reads its own cards, and the card black chose is face down.
      const whiteSeen: ProjectedGame = {
        blackPlayer,
        events: game.events.map((event) =>
          projectEventForVisibility(event, 'white'),
        ),
        gameMode,
        gameState: projectWhiteSeenGameState(game.gameState),
        id,
        openingState: projectWhiteSeenGameState(openingState),
        visibility,
        whitePlayer,
      };
      return whiteSeen;
    }
    case 'blackSeen': {
      // Black's seat reads its own cards, and the card white chose is face down.
      const blackSeen: ProjectedGame = {
        blackPlayer,
        events: game.events.map((event) =>
          projectEventForVisibility(event, 'black'),
        ),
        gameMode,
        gameState: projectBlackSeenGameState(game.gameState),
        id,
        openingState: projectBlackSeenGameState(openingState),
        visibility,
        whitePlayer,
      };
      return blackSeen;
    }
    case 'spectator': {
      // A spectator holds neither hand, so both chosen cards are face down.
      const spectator: ProjectedGame = {
        blackPlayer,
        events: game.events.map((event) =>
          projectEventForVisibility(event, 'spectator'),
        ),
        gameMode,
        gameState: projectSpectatorGameState(game.gameState),
        id,
        openingState: projectSpectatorGameState(openingState),
        visibility,
        whitePlayer,
      };
      return spectator;
    }
    default: {
      const _exhaustive: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustive}`);
    }
  }
}
