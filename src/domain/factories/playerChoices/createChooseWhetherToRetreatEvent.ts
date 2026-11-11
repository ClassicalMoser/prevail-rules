import type { PlayerSide } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseWhetherToRetreat event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `choosesToRetreat` whether the player chooses to retreat;
 * `player` the player who is choosing whether to retreat
 * @returns The event
 */
export function createChooseWhetherToRetreatEvent(fields: {
  player: PlayerSide;
  choosesToRetreat: boolean;
}): ChooseWhetherToRetreatEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'chooseWhetherToRetreat',
    player: fields.player,
    choosesToRetreat: fields.choosesToRetreat,
  };
}
