import type { Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getCurrentUnitStat,
  getSpacesInArc,
  hasEngagedUnits,
  hasSingleUnit,
  isFriendlyUnit,
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
 *
 * @param modifiers - The card the shooter committed before naming its
 * target, when there is one: a Range card reaches one space further out
 * (§4.3.11 step 2). Supporters and the question of whether a unit may fire
 * at all are judged without one.
 */
export function canUnitRangedAttackTarget(
  attacker: UnitWithPlacement,
  target: UnitWithPlacement,
  gameState: GameState,
  modifiers?: Modifier[],
): boolean {
  // A unit cannot fire on a friend.
  const sameSide = isFriendlyUnit(attacker.unit, target.unit.playerSide);
  if (sameSide) {
    return false;
  }
  if (!isUnengagedUnit(gameState, attacker)) {
    return false;
  }
  // Its Range is its current one, with any committed card counted.
  const range = getCurrentUnitStat(
    attacker.unit,
    'range',
    gameState,
    modifiers,
  );
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
