import type { Army, GameModeName } from '@entities';
import type {
  GameStateForVisibility,
  GameStateVisibility,
} from '@game/gameState';

/**
 * A game for a card visibility regime.
 * Board size lives on `gameState.boardState.boardType` and must agree with
 * the size required by {@link gameMode} (enforced by Zod).
 *
 * Mode army composition limits live in `@legality` (`refineGameArmyComposition`).
 *
 * @param V - Card visibility (`authoritative` | `whiteSeen` | `blackSeen`)
 */
export interface GameForVisibility<
  V extends GameStateVisibility = 'authoritative',
> {
  gameMode: GameModeName;
  gameState: GameStateForVisibility<V>;
  /** The unique identifier of the game. */
  id: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The army brought by the black player. */
  blackArmy: Army;
  /** The army brought by the white player. */
  whiteArmy: Army;
}
