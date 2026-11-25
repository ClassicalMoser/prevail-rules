import type { Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getCurrentUnitStat,
  getSpacesInArc,
  hasSingleUnit,
  isFriendlyUnit,
  isSameUnitInstance,
} from '@queries';

/**
 * True when the unit occupies its coordinate alone (not engaged).
 *
 * An engaged unit is locked in its fight and can neither shoot nor support
 * a shot (§4.3.11, §6.1.2), so a shooter and each supporter must stand alone.
 *
 * TODO(composition): a second export in this file, and a read of the board
 * rather than a rule of shooting; it belongs in `@queries/unitPresence` beside
 * `hasSingleUnit`. Settle by moving it there with its own spec.
 *
 * @param gameState - The game, for its board
 * @param unitWithPlacement - The unit, and the space it is said to stand on
 * @returns True when that space holds this unit and nothing else
 * @throws Error when the placement names a coordinate that is not on the board
 */
export function isUnengagedUnit(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
): boolean {
  // The space the placement names.
  const space = getBoardSpace(
    gameState.boardState,
    unitWithPlacement.placement.coordinate,
  );

  // Alone there: a space holding two units holds an engagement (§2.2.1).
  // And the one unit there is this unit, so a placement that names another
  // unit's space does not pass for this one standing free.
  const standsAlone =
    hasSingleUnit(space.unitPresence) &&
    isSameUnitInstance(space.unitPresence.unit, unitWithPlacement.unit);

  // Whether the unit is free of any fight.
  return standsAlone;
}

/**
 * Whether `attacker` may shoot at `target`: attacker unengaged with range &gt; 0,
 * target is an enemy on a space in the attacker's front arc out to current
 * range. No line-of-sight check.
 *
 * @param modifiers - The card the shooter committed before naming its
 * target, when there is one: a Range card reaches one space further out
 * (§4.3.11 step 2). Supporters and the question of whether a unit may shoot
 * at all are judged without one.
 *
 * The same test serves a shooter and its supporters: a supporter must be able
 * to make the same shot on its own (§7.3.4).
 *
 * @param attacker - The unit that would shoot, where it stands
 * @param target - The unit it would shoot at, where it stands
 * @param gameState - The game, for the board and the stats in force
 * @returns True when the target is an enemy in the attacker's arc and the attacker can shoot
 */
export function canUnitRangedAttackTarget(
  attacker: UnitWithPlacement,
  target: UnitWithPlacement,
  gameState: GameState,
  modifiers?: Modifier[],
): boolean {
  // A unit cannot shoot at a friend.
  const sameSide = isFriendlyUnit(attacker.unit, target.unit.playerSide);
  if (sameSide) {
    return false;
  }

  // The shooter must be unengaged (§7.4.1): a unit locked in a fight is busy.
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

  // A unit with no Range cannot shoot at all (§7.4.1). Range is never below
  // zero (§7.1.4), so this is a unit whose Range is 0.
  if (range <= 0) {
    return false;
  }

  // The target must stand in the forward arc, the widening cone of front
  // spaces out to that Range (§2.4.3, §7.4.2).
  // TODO(composition): the target's own engagement, which §7.4.2 also
  // forbids, is refused by `getLegalRangedAttackTargets` instead, and line
  // of sight is not checked at all (RULEBOOK appendix A18). Settle by moving
  // the engaged-target refusal into this predicate when line of sight lands.
  const arc = getSpacesInArc(
    gameState.boardState,
    attacker.placement.coordinate,
    attacker.placement.facing,
    range,
  );
  const inArc = arc.has(target.placement.coordinate);

  // Whether the attacker may aim at the target.
  return inArc;
}
