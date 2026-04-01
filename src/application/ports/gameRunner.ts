import type { GameType, SmallBoard, StandardBoard } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type { PortResponse } from './portResponse';

/** Boards used by playable {@link GameType} variants (excludes unused large board). */
type GamePlayBoard = StandardBoard | SmallBoard;

export interface GameRunner {
  startNewGame: (gameType: GameType) => Promise<PortResponse<void>>;
  /** Applies the choice, then runs chained game effects until the next player-facing event. */
  handlePlayerChoiceSubmission: (
    gameId: string,
    gameType: GameType,
    playerChoice: PlayerChoiceEvent<GamePlayBoard, PlayerChoiceType>,
  ) => Promise<PortResponse<void>>;
}
