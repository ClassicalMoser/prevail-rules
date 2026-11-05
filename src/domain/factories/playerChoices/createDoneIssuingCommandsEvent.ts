import type { PlayerSide } from '@entities';
import type { DoneIssuingCommandsEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A doneIssuingCommands event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `player` the player who is done issuing
 * @returns The event
 */
export function createDoneIssuingCommandsEvent(fields: {
  eventNumber: number;
  player: PlayerSide;
}): DoneIssuingCommandsEvent {
  return {
    choiceType: 'doneIssuingCommands',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
  };
}
