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
 * @param fields - `commanderCoordinate` where this player's commander
 * starts. Must be an empty coordinate in the player's setup zone (may be
 * alone or stacked with a unit placed in this event); `eventNumber` the
 * ordered index of the event in the round, zero-indexed; `player` the player
 * who is setting up the units; `unitPlacements` the units to setup, each
 * with its placement
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
