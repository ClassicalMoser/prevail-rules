import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { IssueCommandEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A issueCommand event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `command` the commands to issue; `player` the player who is
 * issuing the commands; `units` the units to apply the commands to
 * @returns The event
 */
export function createIssueCommandEvent(fields: {
  player: PlayerSide;
  command: Command;
  units: UnitInstance[];
}): IssueCommandEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'issueCommand',
    player: fields.player,
    command: fields.command,
    units: fields.units,
  };
}
