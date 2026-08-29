import type { Board, PlayerSide, UnitInstance } from '@entities';
import type {
  CardStateForVisibility,
  GameStateVisibility,
} from './gameStateVisibility';
import type { RoundState } from '@game/roundState';

/**
 * Game state for a card visibility regime.
 * Board size lives only on {@link Board.boardType} (`boardState.boardType`).
 *
 * @param V - Card visibility (`authoritative` | `whiteSeen` | `blackSeen`)
 */
export interface GameStateForVisibility<
  V extends GameStateVisibility = 'authoritative',
> {
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of both players' cards for this visibility regime. */
  cardState: CardStateForVisibility<V>;
  /** Units not yet placed on the board. */
  reservedUnits: UnitInstance[];
  /** The units that have been routed during the game. */
  routedUnits: UnitInstance[];
  /** The commanders that have been lost during the game. */
  lostCommanders: PlayerSide[];
  /** Board and piece layout. */
  boardState: Board;
  /**
   * Set by `gameOver` apply. Absent while the game is ongoing;
   * `PlayerSide` for a win; `null` for a draw.
   */
  winner?: PlayerSide | null;
}
