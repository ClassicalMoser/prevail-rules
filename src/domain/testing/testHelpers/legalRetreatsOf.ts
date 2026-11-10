import type { MoveDelta, UnitWithPlacement } from '@entities';
import { getLegalRetreats } from '@legality';
import { createGameStateWithUnits } from '@testing/createBoard';

/**
 * Where a unit forced back by combat may fall, as the rules find it on a board
 * holding that unit and whoever else stands near it (§9.1).
 *
 * A retreat state records the paths the engine offered, so a spec that needs
 * one runs the engine rather than writing paths by hand. With no neighbours the
 * unit has open ground behind it; to build "cannot retreat", stand an enemy
 * directly behind it facing it (§9.1.5), or put the unit on the board edge.
 *
 * @param retreating - The unit that is retreating and where it stands
 * @param neighbours - Other units on the board, to block or cut off the retreat
 * @returns The paths the unit may retreat by; empty when it cannot retreat
 */
export function legalRetreatsOf(
  retreating: UnitWithPlacement,
  neighbours: UnitWithPlacement[] = [],
): MoveDelta[][] {
  // The board holds the retreating unit and its neighbours, nothing more.
  const state = createGameStateWithUnits([retreating, ...neighbours]);
  // The engine, not the spec, decides what the retreat options are.
  const paths = getLegalRetreats(retreating, state);
  return paths;
}
