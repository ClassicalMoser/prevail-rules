import type { Coordinate, MoveDelta, UnitFacing } from '@entities';

/**
 * One point in a move in progress. A move is a run of steps and turns
 * (§5.1–§5.2), and each one takes the unit from one of these to the next:
 * a step changes where it stands, a turn changes which way it faces, and
 * either spends from one of the two allowances.
 */
export interface MoveState {
  /** The space the unit stands on at this point in the move. */
  coordinate: Coordinate;
  /** The way the unit faces at this point in the move. */
  facing: UnitFacing;
  /**
   * The space the last step left — the start space, before any step.
   * Whether an engagement is legal depends on which of the defender's
   * spaces the unit stepped in from (§6.2); turning never changes it.
   */
  cameFrom: Coordinate;
  /** Speed still unspent; each step costs 1 (§5.1.2). */
  remainingSpeed: number;
  /** Flexibility still unspent; each turn costs 1 (§5.2.1). */
  remainingFlexibility: number;
  /**
   * The steps and turns taken to reach this point, in order — the path a
   * move event records, so a player can make exactly this move.
   */
  path: readonly MoveDelta[];
}
