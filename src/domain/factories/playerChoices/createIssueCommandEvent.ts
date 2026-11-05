import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { IssueCommandEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A issueCommand event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - command, eventNumber, player, units
 * @returns The event
 */
export function createIssueCommandEvent(fields: {
  command: Command;
  eventNumber: number;
  player: PlayerSide;
  units: UnitInstance[];
}): IssueCommandEvent {
  return {
    choiceType: 'issueCommand',
    command: fields.command,
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    units: fields.units,
  };
}
