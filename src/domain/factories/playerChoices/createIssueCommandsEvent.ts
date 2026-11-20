import type { CommandAllocation, PlayerSide } from '@entities';
import type { IssueCommandsEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * An issueCommands event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `player` the player issuing their orders; `allocation` how
 * they spend the command on their card in play: the units of a units order,
 * or the lines of a lines order, each listed unit by unit
 * @returns The event
 */
export function createIssueCommandsEvent(fields: {
  player: PlayerSide;
  allocation: CommandAllocation;
}): IssueCommandsEvent {
  return {
    allocation: fields.allocation,
    choiceType: 'issueCommands',
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
  };
}
