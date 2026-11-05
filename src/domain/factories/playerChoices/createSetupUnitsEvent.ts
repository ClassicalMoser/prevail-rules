import type { Coordinate, PlayerSide, UnitWithPlacement } from '@entities';
import type { SetupUnitsEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A setupUnits event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - commanderCoordinate, eventNumber, player, unitPlacements
 * @returns The event
 */
export function createSetupUnitsEvent(fields: {
  commanderCoordinate: Coordinate;
  eventNumber: number;
  player: PlayerSide;
  unitPlacements: UnitWithPlacement[];
}): SetupUnitsEvent {
  return {
    choiceType: 'setupUnits',
    commanderCoordinate: fields.commanderCoordinate,
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    unitPlacements: fields.unitPlacements,
  };
}
