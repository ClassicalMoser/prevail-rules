import type { CardState, PlayerSide, UnitInstance } from "@entities";
import type { RoundState } from "./roundState";

/**
 * Non-board slice of {@link GameState} used only for {@link GameStateWithBoard} (generic
 * `boardState: TBoard` correlation). Prefer the concrete {@link StandardGameState} /
 * {@link SmallGameState} / {@link LargeGameState} types for full per-field IDE documentation.
 */
export interface GameStateBase {
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of both players' cards. */
  cardState: CardState;
  /** Units not yet placed on the board. */
  reservedUnits: Set<UnitInstance>;
  /** The units that have been routed during the game. */
  routedUnits: Set<UnitInstance>;
  /** The commanders that have been lost during the game. */
  lostCommanders: Set<PlayerSide>;
}
