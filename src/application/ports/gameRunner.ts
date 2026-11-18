import type { GameModeName } from '@entities';
import type { PlayerChoiceEvent } from '@events';
import type {
  Game,
  GameState,
  GameStateVisibility,
  ProjectedGame,
} from '@game';
import type { RunnerResponse } from './runnerResponse';

/** What a game is between: its id, the two players, and the army each brings. */
export type NewGame = Pick<
  Game,
  'id' | 'whitePlayer' | 'blackPlayer' | 'whiteArmy' | 'blackArmy'
>;

export interface GameRunner {
  startNewGame: (
    gameMode: GameModeName,
    newGame: NewGame,
  ) => Promise<RunnerResponse<void>>;
  /** Applies the choice, then runs chained game effects until the next player-facing event. */
  handlePlayerChoiceSubmission: (
    gameId: string,
    gameMode: GameModeName,
    playerChoice: PlayerChoiceEvent,
  ) => Promise<RunnerResponse<void>>;
  /**
   * Runs chained game effects until the next player-facing choice.
   * No-op (success) when a player choice is already expected — used to unstick
   * sessions after refresh / reconnect mid-effect.
   */
  advanceUntilPlayerChoice: (
    gameId: string,
    gameMode: GameModeName,
  ) => Promise<RunnerResponse<void>>;
  /**
   * Returns the current game state as one viewer may see it (wire reconcile
   * after refresh / missed updates), without its history. A seat's view hides
   * the opponent's hand, a spectator's hides both, and the authoritative view
   * hides nothing; board units are full in every view.
   */
  requestGameStateSnapshot: (
    gameId: string,
    gameMode: GameModeName,
    visibility: GameStateVisibility,
  ) => Promise<RunnerResponse<GameState>>;
  /**
   * Returns the whole game as one viewer may see it: the opening state, every
   * event and the current state, in that view, and no armies. For a client
   * joining or reloading a game in play.
   */
  requestGameRecord: (
    gameId: string,
    gameMode: GameModeName,
    visibility: GameStateVisibility,
  ) => Promise<RunnerResponse<ProjectedGame>>;
}
