import type { PlayerSide } from '@entities';
import type { AssignUnitSupportEvent, UnitSupportAssignment } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A assignUnitSupport event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `assignments` per-grant assignments (omit unused grants);
 * `player`
 * @returns The event
 */
export function createAssignUnitSupportEvent(fields: {
  player: PlayerSide;
  assignments: UnitSupportAssignment[];
}): AssignUnitSupportEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'assignUnitSupport',
    player: fields.player,
    assignments: fields.assignments,
  };
}
