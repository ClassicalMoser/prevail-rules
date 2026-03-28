import type { Board, GameType } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type { PortResponse } from './portResponse';

export interface GameRunner {
  startNewGame: <T extends GameType>(gameType: T) => Promise<void>;
  /** Applies the choice, then runs chained game effects until the next player-facing event. */
  handlePlayerChoiceSubmission: (
    gameId: string,
    gameType: GameType,
    playerChoice: PlayerChoiceEvent<Board, PlayerChoiceType>,
  ) => Promise<PortResponse<void>>;
}
