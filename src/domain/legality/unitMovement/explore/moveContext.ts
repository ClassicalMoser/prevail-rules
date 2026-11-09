import type { Coordinate, PlayerSide, UnitPlacement } from '@entities';
import type { GameState } from '@game';

/**
 * What a whole move is bound by, settled once where the move begins and
 * shared by every step and turn of it. Carrying it as one value is what
 * lets each movement rule live in its own small function without every
 * one of them taking the same six arguments. `createMoveContext` builds it.
 */
export interface MoveContext {
  /** The game the move is made in; the board and the units on it. */
  gameState: GameState;
  /** The moving unit's side: friends may be passed through, enemies engaged. */
  unitSide: PlayerSide;
  /** Where and how the unit stood when the move began. */
  start: UnitPlacement;
  /** An ordered advance, or a retreat forced by combat (§9.1). */
  direction: 'advance' | 'retreat';
  /** Speed for the whole move, sampled where it began (§5.1.4). */
  totalSpeed: number;
  /** Flexibility for the whole move, sampled where it began (§5.1.4). */
  totalFlexibility: number;
  /**
   * The half of the board behind the unit's starting rank. A retreat may
   * neither pass through nor end anywhere else (§2.3.2, §9.1.2); the start
   * space is not behind its own rank, so a retreat cannot end where it
   * began.
   */
  retreatSpaces: Set<Coordinate>;
}
