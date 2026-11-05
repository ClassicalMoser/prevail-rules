import type { Coordinate, PlayerSide } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseMeleeResolution event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - eventNumber, player, space
 * @returns The event
 */
export function createChooseMeleeResolutionEvent(fields: {
  eventNumber: number;
  player: PlayerSide;
  space: Coordinate;
}): ChooseMeleeResolutionEvent {
  return {
    choiceType: 'chooseMeleeResolution',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    space: fields.space,
  };
}
