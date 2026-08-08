import type { GameModeName, PlayerSide } from '@entities';
import type { PlayerChoiceEvent } from '@events';
import type { Game } from '@game';
import type { PortResponse } from './portResponse';

export interface GameRunner {
  startNewGame: (gameMode: GameModeName) => Promise<PortResponse<void>>;
  /** Applies the choice, then runs chained game effects until the next player-facing event. */
  handlePlayerChoiceSubmission: (
    gameId: string,
    gameMode: GameModeName,
    playerChoice: PlayerChoiceEvent,
  ) => Promise<PortResponse<void>>;
  /**
   * Returns the current game projected for `playerSide` (wire reconcile after
   * refresh / missed updates). Opponent cards are hidden; board units are full.
   */
  requestGameStateSnapshot: (
    gameId: string,
    gameMode: GameModeName,
    playerSide: PlayerSide,
  ) => Promise<PortResponse<Game>>;
}
