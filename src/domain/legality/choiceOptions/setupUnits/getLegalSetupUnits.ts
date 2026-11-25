import type { PlayerSide, UnitInstance } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import { getBoardSpace, hasNoUnit, isFriendlyUnit } from '@queries';

import { getSetupZoneCoordinates } from './getSetupZoneCoordinates';

/**
 * Atomic setup options for one player: reserved units still to place, and
 * empty coordinates in their provisional setup zone.
 *
 * The commander may be committed on any of {@link LegalSetupUnits.coordinates}
 * in the same `SetupUnitsEvent` (alone or stacked with a deployed unit).
 */
export interface LegalSetupUnits {
  /** The side placing its army now: the side holding the initiative first, then the other (§3.5.4). */
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
 * `isValidSetupUnitsEvent` checks integrity of the commit.
 *
 * Each side places its whole army at once, one unit to a space, in its own
 * zone (§3.5.1); the bare-board zone is the three rows nearest its edge less
 * the outer two columns at each end (§3.5.4, `getSetupZoneCoordinates`).
 *
 * @param gameState - The game in setup, round 0
 * @param player - The side the sequencer asked to place its army
 * @returns That side's units still in reserve, and the empty spaces of its zone
 *
 * @throws Error when the player has no units left to place
 */
export function getLegalSetupUnits<S extends GameState>(
  gameState: S,
  player: PlayerSide,
): LegalSetupUnits {
  // Before deployment the whole army waits in reserve; what is still there is
  // what this side has left to place.
  // TODO(composition): "this side's units in reserve" is also filtered by
  // hand in `getExpectedSetupEvent` and `findWinnerFromNoUnits`. Settle with
  // one reader in `@queries` that all three ask.
  const units = gameState.reservedUnits.filter((unit) => {
    // Only this player's reserved units remain to place.
    const belongsToPlayer = isFriendlyUnit(unit, player);
    return belongsToPlayer;
  });

  // The sequencer asks only a side with units still in reserve (§3.5).
  if (units.length === 0) {
    throw new Error(`${player} has no units left to place`);
  }

  // The spaces this side may deploy into, before any unit stands there.
  const zone = getSetupZoneCoordinates(gameState.boardState, player);

  // One unit to a space (§3.5.1): a space already holding a unit is not
  // offered again. The commander may still share a space with one of this
  // side's units (§3.5.3), and is placed among these same spaces.
  const coordinates = zone.filter((coordinate) => {
    // Only an empty space of the zone may take a unit.
    const { unitPresence } = getBoardSpace(gameState.boardState, coordinate);
    const isEmpty = hasNoUnit(unitPresence);
    return isEmpty;
  });

  // The units still to place, and the empty spaces they may go to.
  const legal: LegalSetupUnits = { coordinates, player, units };
  return legal;
}
