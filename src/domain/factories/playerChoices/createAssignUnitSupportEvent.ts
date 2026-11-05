import type { PlayerSide } from '@entities';
import type { AssignUnitSupportEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A assignUnitSupport event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - assignments, eventNumber, player
 * @returns The event
 */
export function createAssignUnitSupportEvent(fields: {
  assignments: AssignUnitSupportEvent['assignments'];
  eventNumber: number;
  player: PlayerSide;
}): AssignUnitSupportEvent {
  return {
    assignments: fields.assignments,
    choiceType: 'assignUnitSupport',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
  };
}
