import type {
  Coordinate,
  PlayerSide,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import { getCurrentUnitStat, getSpacesBehind } from '@queries';

/**
 * What a whole move is bound by, settled once where the move begins and
 * shared by every step and turn of it. Carrying it as one value is what
 * lets each movement rule live in its own small function without every
 * one of them taking the same six arguments.
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

/**
 * Settles the context a move is bound by, at the moment the move begins.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The unit and its starting position
 * @param direction - The direction of movement: 'advance' or 'retreat'
 * @returns The context every step and turn of the move is judged in
 * @throws Error when the direction is neither 'advance' nor 'retreat'
 */
export function createMoveContext(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  direction: 'advance' | 'retreat',
): MoveContext {
  // The type names the two directions, but a caller outside the type system
  // (a test, a wire payload) still gets a clear fault rather than a walk
  // that silently explores nothing.
  if (direction !== 'advance' && direction !== 'retreat') {
    throw new Error('Invalid direction');
  }

  const { placement: start, unit } = unitWithPlacement;

  // The move's whole budget is sampled here, once, where the move begins
  // (§5.1.4): a round effect's reach is read from the start space and is
  // neither lost nor gained by where the unit walks.
  const totalSpeed = getCurrentUnitStat(unit, 'speed', gameState);
  const totalFlexibility = getCurrentUnitStat(unit, 'flexibility', gameState);

  // The retreat region is computed for advances too; it is cheap, and an
  // advance simply never consults it.
  const retreatSpaces = getSpacesBehind(
    gameState.boardState,
    start.coordinate,
    start.facing,
  );

  const context: MoveContext = {
    direction,
    gameState,
    retreatSpaces,
    start,
    totalFlexibility,
    totalSpeed,
    unitSide: unit.playerSide,
  };
  return context;
}
