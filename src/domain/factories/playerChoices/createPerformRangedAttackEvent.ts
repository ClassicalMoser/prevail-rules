import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { PerformRangedAttackEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A performRangedAttack event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - eventNumber, player, supportingUnits, targetUnit, unit
 * @returns The event
 */
export function createPerformRangedAttackEvent(fields: {
  eventNumber: number;
  player: PlayerSide;
  supportingUnits: UnitWithPlacement[];
  targetUnit: UnitWithPlacement;
  unit: UnitWithPlacement;
}): PerformRangedAttackEvent {
  return {
    choiceType: 'performRangedAttack',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    supportingUnits: fields.supportingUnits,
    targetUnit: fields.targetUnit,
    unit: fields.unit,
  };
}
