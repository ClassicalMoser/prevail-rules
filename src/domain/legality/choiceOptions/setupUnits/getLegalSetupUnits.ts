import type { Coordinate, PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getBoardSpace, hasNoUnit, isFriendlyUnit } from '@queries';

import { getSetupZoneCoordinates } from './getSetupZoneCoordinates';

/**
 * Atomic setup options for one player: reserved units still to place, and
 * empty coordinates in their provisional setup zone.
 *
 * The commander may be committed on any of {@link LegalSetupUnits.coordinates}
 * in the same {@link SetupUnitsEvent} (alone or stacked with a deployed unit).
 */
export interface LegalSetupUnits {
  player: PlayerSide;
  /** This player's units still in `reservedUnits`. */
  units: readonly UnitInstance[];
  /**
   * Empty setup-zone coordinates available for unit placement and/or
   * commander placement.
   */
  coordinates: readonly Coordinate[];
}

/**
 * Returns setup atoms for `player`: reserved units and empty zone spaces.
 *
 * Does not expand placement combinations — UI places each unit onto a zone
 * coordinate and picks a commander coordinate among the same empty zone cells;
 * {@link isValidSetupUnitsEvent} checks integrity of the commit.
 *
 * @throws Error when the player has no units left to place
 */
export function getLegalSetupUnits<S extends GameState>(
  gameState: S,
  player: PlayerSide,
): LegalSetupUnits {
  const units = gameState.reservedUnits.filter((unit) => {
    // Only this player's reserved units remain to place.
    const belongsToPlayer = isFriendlyUnit(unit, player);
    return belongsToPlayer;
  });
  // The sequencer asks only a side with units still in reserve (§3.5).
  if (units.length === 0) {
    throw new Error(`${player} has no units left to place`);
  }

  const zone = getSetupZoneCoordinates(gameState.boardState, player);
  const coordinates = zone.filter((coordinate) => {
    // Only an empty space of the zone may take a unit.
    const { unitPresence } = getBoardSpace(gameState.boardState, coordinate);
    const isEmpty = hasNoUnit(unitPresence);
    return isEmpty;
  });

  return { coordinates, player, units };
}
