import type { Coordinate, PlayerSide } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseMeleeResolution event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `player` the player who is choosing the melee resolution;
 * `space` the space the melee is occurring in
 * @returns The event
 */
export function createChooseMeleeResolutionEvent(fields: {
  player: PlayerSide;
  space: Coordinate;
}): ChooseMeleeResolutionEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'chooseMeleeResolution',
    player: fields.player,
    space: fields.space,
  };
}
