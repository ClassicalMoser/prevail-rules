import type { Coordinate, PlayerSide, UnitWithPlacement } from '@entities';
import type { SetupUnitsEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A setupUnits event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `commanderCoordinate` where this player's commander starts.
 * Must be an empty coordinate in the player's setup zone (may be alone or
 * stacked with a unit placed in this event); `player` the player who is setting
 * up the units; `unitPlacements` the units to setup, each with its placement
 * @returns The event
 */
export function createSetupUnitsEvent(fields: {
  player: PlayerSide;
  commanderCoordinate: Coordinate;
  unitPlacements: UnitWithPlacement[];
}): SetupUnitsEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'setupUnits',
    player: fields.player,
    commanderCoordinate: fields.commanderCoordinate,
    unitPlacements: fields.unitPlacements,
  };
}
