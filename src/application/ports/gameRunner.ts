import type { GameModeName } from "@entities";
import type { PlayerChoiceEvent } from "@events";
import type { PortResponse } from "./portResponse";

export interface GameRunner {
  startNewGame: (gameMode: GameModeName) => Promise<PortResponse<void>>;
  /** Applies the choice, then runs chained game effects until the next player-facing event. */
  handlePlayerChoiceSubmission: (
    gameId: string,
    playerChoice: PlayerChoiceEvent,
  ) => Promise<PortResponse<void>>;
}
