import type { Coordinate, PlayerSide, UnitInstance } from '@entities';
import { hasNoUnit } from '@entities';
import type { GameState } from '@game';
import { getBoardSpace } from '@queries';

import { getSetupZoneCoordinates } from './getSetupZoneCoordinates';

/**
 * Atomic setup options for one player: reserved units still to place, and
 * empty coordinates in their provisional setup zone.
 *
 * The commander may be committed on any of {@link LegalSetupUnits.coordinates}
 * in the same {@link SetupUnitsEvent} (alone or stacked with a deployed unit).
 *
 * `null` when that player has nothing left in reserve.
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
 */
export function getLegalSetupUnits<S extends GameState>(
  gameState: S,
  player: PlayerSide,
): LegalSetupUnits | null {
  const units = gameState.reservedUnits.filter(
    (unit) => unit.playerSide === player,
  );
  if (units.length === 0) {
    return null;
  }

  const zone = getSetupZoneCoordinates(gameState.boardState, player);
  const coordinates = zone.filter((coordinate) => {
    try {
      return hasNoUnit(
        getBoardSpace(gameState.boardState, coordinate).unitPresence,
      );
    } catch {
      return false;
    }
  });

  return { coordinates, player, units };
}
