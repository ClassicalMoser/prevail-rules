import type {
  CommandType,
  Modifier,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import type { BotContext } from './botContext';
import { getLegalRangedAttackTargets, getLegalUnitMoves } from '@legality';
import { appraiseBlow, appraisePlacement } from '@bot/appraisal';

/**
 * How much better off a unit would be after its best move than where it
 * stands: the best of every ending its move may reach (§4.3.10), each judged
 * as a place to stand or an engagement to start, less what standing still is
 * worth. Zero or less means the unit has nowhere better to go.
 *
 * @param unit - The unit and where it stands
 * @param context - What the bot decides from
 * @param modifiers - What a committed card would add, if one is weighed
 * @returns The gain from its best move
 */
export function appraiseMoveGain(
  unit: UnitWithPlacement,
  context: BotContext,
  modifiers?: Modifier[],
): number {
  const { view, survey, temperament } = context;
  const standing = appraisePlacement(
    view,
    survey,
    unit,
    unit.placement,
    temperament,
  );
  let best = standing;
  for (const move of getLegalUnitMoves(unit, view, modifiers)) {
    const score = appraisePlacement(
      view,
      survey,
      unit,
      move.placement,
      temperament,
    );
    best = Math.max(best, score);
  }
  return best - standing;
}

/**
 * The most a unit's shot could take from any enemy in its arc and range
 * (§7.4.2), without support.
 *
 * @param unit - The shooter and where it stands
 * @param context - What the bot decides from
 * @param modifiers - What a committed card would add, if one is weighed
 * @returns The points the best shot takes; zero with nothing to shoot at
 */
export function appraiseBestShot(
  unit: UnitWithPlacement,
  context: BotContext,
  modifiers?: Modifier[],
): number {
  const { view } = context;
  let best = 0;
  for (const target of getLegalRangedAttackTargets(unit, view, modifiers)) {
    best = Math.max(best, appraiseBlow(view, unit.unit, 0, target.unit));
  }
  return best;
}

/** Names a unit instance so the same unit is appraised once per decision. */
function unitKey(unit: UnitInstance): string {
  return `${unit.playerSide}|${unit.unitType.id}|${unit.instanceNumber}`;
}

/**
 * Remembers what ordering each unit is worth while one order is decided,
 * since lines and unit lists share units and each appraisal walks every move
 * the unit could make.
 *
 * @param context - What the bot decides from
 * @param type - Whether the order moves or shoots
 * @returns The worth of ordering a unit
 */
export function createOrderAppraiser(
  context: BotContext,
  type: CommandType,
): (unit: UnitWithPlacement) => number {
  const known = new Map<string, number>();
  return (unit) => {
    const key = unitKey(unit.unit);
    const remembered = known.get(key);
    if (remembered !== undefined) {
      return remembered;
    }
    const worth =
      type === 'movement'
        ? appraiseMoveGain(unit, context)
        : appraiseBestShot(unit, context);
    known.set(key, worth);
    return worth;
  };
}
