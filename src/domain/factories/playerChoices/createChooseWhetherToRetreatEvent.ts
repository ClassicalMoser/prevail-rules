import type { PlayerSide } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseWhetherToRetreat event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - choosesToRetreat, eventNumber, player
 * @returns The event
 */
export function createChooseWhetherToRetreatEvent(fields: {
  choosesToRetreat: boolean;
  eventNumber: number;
  player: PlayerSide;
}): ChooseWhetherToRetreatEvent {
  return {
    choiceType: 'chooseWhetherToRetreat',
    choosesToRetreat: fields.choosesToRetreat,
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
  };
}
