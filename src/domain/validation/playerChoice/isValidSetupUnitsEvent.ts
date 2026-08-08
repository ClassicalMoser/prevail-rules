import type { UnitInstance } from '@entities';
import type { ValidationResult } from '@utils';
import type { SetupUnitsEvent } from '@events';
import type { GameState } from '@game';
import { getLegalSetupUnits } from '@legality';
import { isSameUnitInstance } from '@queries';

function unitKey(unit: UnitInstance): string {
  return `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
}

/**
 * Validates a SetupUnitsEvent as an integral commit over
 * {@link getLegalSetupUnits} atoms:
 * - exact cover of the player's reserved units (each once)
 * - every coordinate in the empty setup zone
 * - unique coordinates
 * - each placement's unit belongs to the event player
 */
export function isValidSetupUnitsEvent(
  event: SetupUnitsEvent,
  state: GameState,
): ValidationResult {
  try {
    const legal = getLegalSetupUnits(state, event.player);
    if (legal === null) {
      return {
        errorReason: `Setup units is not expected for ${event.player}`,
        result: false,
      };
    }

    if (event.player !== legal.player) {
      return {
        errorReason: `Expected setup from ${legal.player}, got ${event.player}`,
        result: false,
      };
    }

    if (event.unitPlacements.length !== legal.units.length) {
      return {
        errorReason: `Expected ${legal.units.length} unit placements, got ${event.unitPlacements.length}`,
        result: false,
      };
    }

    const legalUnitKeys = new Set(legal.units.map(unitKey));
    const seenUnitKeys = new Set<string>();
    const seenCoordinates = new Set<string>();
    const legalCoordinates = new Set(legal.coordinates);

    for (const placement of event.unitPlacements) {
      if (placement.unit.playerSide !== event.player) {
        return {
          errorReason: 'Setup placement unit does not belong to the player',
          result: false,
        };
      }

      const key = unitKey(placement.unit);
      if (!legalUnitKeys.has(key)) {
        return {
          errorReason: `Unit is not in ${event.player}'s reserved units`,
          result: false,
        };
      }
      if (seenUnitKeys.has(key)) {
        return {
          errorReason: 'Duplicate unit in setup placements',
          result: false,
        };
      }
      seenUnitKeys.add(key);

      if (!legalCoordinates.has(placement.placement.coordinate)) {
        return {
          errorReason: `Coordinate ${placement.placement.coordinate} is not an empty setup-zone space for ${event.player}`,
          result: false,
        };
      }
      if (seenCoordinates.has(placement.placement.coordinate)) {
        return {
          errorReason: 'Duplicate coordinate in setup placements',
          result: false,
        };
      }
      seenCoordinates.add(placement.placement.coordinate);

      // Confirm value-equality against reserved list (not only key shape)
      const inReserve = legal.units.some(
        (unit) => isSameUnitInstance(unit, placement.unit).result,
      );
      if (!inReserve) {
        return {
          errorReason: `Unit is not in ${event.player}'s reserved units`,
          result: false,
        };
      }
    }

    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
