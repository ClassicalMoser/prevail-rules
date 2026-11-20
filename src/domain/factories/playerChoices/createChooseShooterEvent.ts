import type { PlayerSide, UnitInstance } from '@entities';
import type { ChooseShooterEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseShooter event: the player names the next unit to shoot under a Shoot
 * order (§4.3.11 step 1).
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `player` the player carrying out the order; `unit` the unit
 * that shoots next, by who it is
 * @returns The event
 */
export function createChooseShooterEvent(fields: {
  player: PlayerSide;
  unit: UnitInstance;
}): ChooseShooterEvent {
  const event: ChooseShooterEvent = {
    choiceType: 'chooseShooter',
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    unit: fields.unit,
  };
  return event;
}
