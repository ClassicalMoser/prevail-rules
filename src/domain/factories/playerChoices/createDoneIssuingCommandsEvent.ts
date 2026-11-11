import type { PlayerSide } from '@entities';
import type { DoneIssuingCommandsEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A doneIssuingCommands event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `player` the player who is done issuing
 * @returns The event
 */
export function createDoneIssuingCommandsEvent(fields: {
  player: PlayerSide;
}): DoneIssuingCommandsEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'doneIssuingCommands',
    player: fields.player,
  };
}
