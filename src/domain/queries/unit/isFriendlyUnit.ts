import type { PlayerSide, UnitInstance } from '@entities';

/**
 * Whether a unit fights for this side.
 *
 * Pass a player's seat, or another unit's `playerSide`. Both ask the same
 * question: is this unit friendly to that side?
 *
 * @param unit - The unit to check
 * @param playerSide - The side the unit would have to fight for
 * @returns True if the unit belongs to that side, false otherwise
 */
export function isFriendlyUnit(
  unit: UnitInstance,
  playerSide: PlayerSide,
): boolean {
  // A unit fights for the side that fields it; friend and foe decide who may
  // support, block, or be engaged.
  const friendly = unit.playerSide === playerSide;
  return friendly;
}
