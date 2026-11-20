import type { PlayerSide } from '@entities';
import type { IssueCommandEvent, Order } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A issueCommand event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `player` the player giving the order, or stopping; `order`
 * the command used and the units or line's two ends it is given to, or
 * `'none'` to stop giving orders
 * @returns The event
 */
export function createIssueCommandEvent(fields: {
  player: PlayerSide;
  order: Order | 'none';
}): IssueCommandEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'issueCommand',
    player: fields.player,
    order: fields.order,
  };
}
