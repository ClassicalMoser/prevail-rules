import type { UnitWithPlacement } from '@entities';
import { hasEngagedUnits, hasSingleUnit } from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getCurrentUnitStat,
  getSpacesInArc,
  isSameUnitInstance,
} from '@queries';

/**
 * True when the unit occupies its coordinate alone (not engaged).
 */
export function isUnengagedUnit(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
): boolean {
  try {
    const space = getBoardSpace(
      gameState.boardState,
      unitWithPlacement.placement.coordinate,
    );
    return (
      hasSingleUnit(space.unitPresence) &&
      !hasEngagedUnits(space.unitPresence) &&
      isSameUnitInstance(space.unitPresence.unit, unitWithPlacement.unit).result
    );
  } catch {
    return false;
  }
}

/**
 * Whether `attacker` may fire at `target`: attacker unengaged with range &gt; 0,
 * target is an enemy on a space in the attacker's front arc out to current
 * range. No line-of-sight check.
 */
export function canUnitRangedAttackTarget(
  attacker: UnitWithPlacement,
  target: UnitWithPlacement,
  gameState: GameState,
): boolean {
  if (attacker.unit.playerSide === target.unit.playerSide) {
    return false;
  }
  if (!isUnengagedUnit(gameState, attacker)) {
    return false;
  }
  const range = getCurrentUnitStat(attacker.unit, 'range', gameState);
  if (range <= 0) {
    return false;
  }
  const arc = getSpacesInArc(
    gameState.boardState,
    attacker.placement.coordinate,
    attacker.placement.facing,
    range,
  );
  return arc.has(target.placement.coordinate);
}
