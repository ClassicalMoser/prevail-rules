import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { PerformRangedAttackEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A performRangedAttack event: the target of a shot, and its supporters
 * (§4.3.11 steps 3–4).
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `player` the shooting player; `supportingUnits` the units
 * spending their shots on this one; `targetUnit` the enemy unit being shot
 * at — the shooter itself was named by `chooseShooter`
 * @returns The event
 */
export function createPerformRangedAttackEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  supportingUnits: UnitWithPlacement[];
  targetUnit: UnitWithPlacement;
}): PerformRangedAttackEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'performRangedAttack',
    player: fields.player,
    eventNumber: fields.eventNumber,
    supportingUnits: fields.supportingUnits,
    targetUnit: fields.targetUnit,
  };
}
