import type { BoardSpace, PlayerSide } from '@entities';
import { hasEngagedUnits } from './hasEngagedUnits';
import { hasSingleUnit } from './hasSingleUnit';

/**
 * Whether an enemy unit stands in the space. An engagement counts as an enemy
 * for either player: the two sides are not compared.
 *
 * @param playerSide - The side of the player to check for enemy units
 * @param space - The space to check
 * @returns True if an enemy unit is found in the space
 */
export function hasEnemyUnit(
  playerSide: PlayerSide,
  space: BoardSpace,
): boolean {
  // An engagement counts as an enemy for either player.
  if (hasEngagedUnits(space.unitPresence)) {
    // An engaged space holds an enemy of whoever asks.
    return true;
  }
  // A single unit is an enemy when it fights for the other side; an empty
  // space holds none.
  // TODO(composition): the side test repeats `isFriendlyUnit`, the same
  // comparison with no throw. Settled by calling it.
  const enemy =
    hasSingleUnit(space.unitPresence) &&
    space.unitPresence.unit.playerSide !== playerSide;

  // True when an enemy stands here, on its own or in a fight.
  return enemy;
}
