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
  // The player is the one the sequencer asked, so they have units to place;
  // asked for a side with none left, the enumerator throws.
  const legal = getLegalSetupUnits(state, event.player);

  // The whole army is placed at once (§3.5.1). With each unit placed once
  // and only from the reserve (checked below), as many placements as units
  // waiting means every one of them is placed.
  if (event.unitPlacements.length !== legal.units.length) {
    const notWholeArmy: ValidationResult = {
      errorReason: `Expected ${legal.units.length} unit placements, got ${event.unitPlacements.length}`,
      result: false,
    };
    return notWholeArmy;
  }

  // The units and spaces taken by the placements so far, so a second use of
  // either is caught.
  const placedUnits: UnitInstance[] = [];
  const usedCoordinates: Coordinate[] = [];
  for (const placement of event.unitPlacements) {
    // Each placement is one of this player's own units: a side deploys its
    // own army, never the other's.
    if (!isFriendlyUnit(placement.unit, event.player)) {
      const notTheirUnit: ValidationResult = {
        errorReason: 'Setup placement unit does not belong to the player',
        result: false,
      };
      return notTheirUnit;
    }

    // ...still in reserve: the army the side brought, not yet on the board.
    if (!hasUnitInArray(legal.units, placement.unit)) {
      const notInReserve: ValidationResult = {
        errorReason: `Unit is not in ${event.player}'s reserved units`,
        result: false,
      };
      return notInReserve;
    }

    // ...placed once: a unit stands on one space.
    if (hasUnitInArray(placedUnits, placement.unit)) {
      const placedTwice: ValidationResult = {
        errorReason: 'Duplicate unit in setup placements',
        result: false,
      };
      return placedTwice;
    }
    placedUnits.push(placement.unit);

    // Each goes to an empty space of the player's own zone (§3.5.1, §3.5.4).
    const { coordinate } = placement.placement;
    if (!legal.coordinates.includes(coordinate)) {
      const outsideZone: ValidationResult = {
        errorReason: `Coordinate ${coordinate} is not an empty setup-zone space for ${event.player}`,
        result: false,
      };
      return outsideZone;
    }

    // ...one unit to a space (§2.2.1, §3.5.1).
    if (usedCoordinates.includes(coordinate)) {
      const spaceTaken: ValidationResult = {
        errorReason: 'Duplicate coordinate in setup placements',
        result: false,
      };
      return spaceTaken;
    }
    usedCoordinates.push(coordinate);
  }

  // The commander stands in the zone too, alone or with one of the units
  // this event places (§3.5.3): commanders take no space of their own.
  if (!legal.coordinates.includes(event.commanderCoordinate)) {
    const commanderOutsideZone: ValidationResult = {
      errorReason: `Commander coordinate ${event.commanderCoordinate} is not an empty setup-zone space for ${event.player}`,
      result: false,
    };
    return commanderOutsideZone;
  }

  // The whole army and its commander deploy as placed.
  const valid: ValidationResult = { result: true };
  return valid;
}
