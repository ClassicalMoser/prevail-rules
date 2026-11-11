import type { Coordinate, UnitInstance } from '@entities';
import type { ValidationResult } from '@utils';
import type { SetupUnitsEvent } from '@events';
import type { GameState } from '@game';
import { getLegalSetupUnits } from '@legality';
import { hasUnitInArray, isFriendlyUnit } from '@queries';

/**
 * Validates a SetupUnitsEvent as an integral commit over
 * {@link getLegalSetupUnits} atoms:
 * - exact cover of the player's reserved units (each once)
 * - every unit coordinate in the empty setup zone
 * - unique unit coordinates
 * - each placement's unit belongs to the event player
 * - commander on an empty setup-zone coordinate (alone or with a deployed unit)
 */
export function isValidSetupUnitsEvent(
  event: SetupUnitsEvent,
  state: GameState,
): ValidationResult {
  // The player is the one the sequencer asked, so they have units to place.
  const legal = getLegalSetupUnits(state, event.player);

  // The whole army is placed at once (§3.5.1).
  if (event.unitPlacements.length !== legal.units.length) {
    return {
      errorReason: `Expected ${legal.units.length} unit placements, got ${event.unitPlacements.length}`,
      result: false,
    };
  }

  const placedUnits: UnitInstance[] = [];
  const usedCoordinates: Coordinate[] = [];
  for (const placement of event.unitPlacements) {
    // Each placement is one of this player's own units...
    if (!isFriendlyUnit(placement.unit, event.player)) {
      return {
        errorReason: 'Setup placement unit does not belong to the player',
        result: false,
      };
    }
    // ...still in reserve...
    if (!hasUnitInArray(legal.units, placement.unit)) {
      return {
        errorReason: `Unit is not in ${event.player}'s reserved units`,
        result: false,
      };
    }
    // ...placed once.
    if (hasUnitInArray(placedUnits, placement.unit)) {
      return {
        errorReason: 'Duplicate unit in setup placements',
        result: false,
      };
    }
    placedUnits.push(placement.unit);

    // Each goes to an empty space of the player's zone, one unit to a space.
    const { coordinate } = placement.placement;
    if (!legal.coordinates.includes(coordinate)) {
      return {
        errorReason: `Coordinate ${coordinate} is not an empty setup-zone space for ${event.player}`,
        result: false,
      };
    }
    if (usedCoordinates.includes(coordinate)) {
      return {
        errorReason: 'Duplicate coordinate in setup placements',
        result: false,
      };
    }
    usedCoordinates.push(coordinate);
  }

  // The commander stands in the zone too, alone or with one of the units.
  if (!legal.coordinates.includes(event.commanderCoordinate)) {
    return {
      errorReason: `Commander coordinate ${event.commanderCoordinate} is not an empty setup-zone space for ${event.player}`,
      result: false,
    };
  }

  return { result: true };
}
