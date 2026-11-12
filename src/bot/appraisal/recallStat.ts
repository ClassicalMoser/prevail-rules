import type {
  AttackResult,
  Modifier,
  UnitInstance,
  UnitStatName,
} from '@entities';
import type { GameState } from '@game';
import { applyAttackValue, getRawUnitStat } from '@queries';

/**
 * What the bot has already read from one view of the game. A unit's stats
 * depend on the round effects in play and on whether it stands within its
 * general's reach (§4.3.7), and working that out walks the board. The bot
 * asks the same few questions of the same view thousands of times in one
 * decision, so it asks the rules once and remembers the answer. Each view is
 * a new object, so nothing is remembered past the board it was read from.
 */
interface ViewMemory {
  stats: Map<string, number>;
  blows: Map<string, AttackResult>;
}

const memories = new WeakMap<GameState, ViewMemory>();

function memoryOf(view: GameState): ViewMemory {
  let memory = memories.get(view);
  if (memory === undefined) {
    memory = { blows: new Map(), stats: new Map() };
    memories.set(view, memory);
  }
  return memory;
}

/** Names a unit instance, for remembering what was read about it. */
function unitKey(unit: UnitInstance): string {
  return `${unit.playerSide}|${unit.unitType.id}|${unit.instanceNumber}`;
}

/** Names a set of modifiers, for remembering what they change. */
function modifiersKey(modifiers: Modifier[] | undefined): string {
  if (modifiers === undefined) {
    return '';
  }
  return modifiers
    .map((modifier) => `${modifier.type}${modifier.value}`)
    .join(',');
}

/**
 * A unit's stat as the rules give it in this view, with any committed card's
 * modifiers (`getRawUnitStat`), remembered for the view.
 *
 * @param view - The game as the bot sees it
 * @param unit - The unit
 * @param stat - The stat
 * @param modifiers - What a committed card would add, if one is weighed
 * @returns The stat
 */
export function recallStat(
  view: GameState,
  unit: UnitInstance,
  stat: UnitStatName,
  modifiers?: Modifier[],
): number {
  const { stats } = memoryOf(view);
  const key = `${unitKey(unit)}|${stat}|${modifiersKey(modifiers)}`;
  let value = stats.get(key);
  if (value === undefined) {
    value = getRawUnitStat(unit, stat, view, modifiers);
    stats.set(key, value);
  }
  return value;
}

/**
 * Which of a unit's thresholds an attack value meets in this view
 * (`applyAttackValue`, §7.5.1), remembered for the view.
 *
 * @param view - The game as the bot sees it
 * @param attackValue - The attack landing on it
 * @param target - The unit struck
 * @param modifiers - What the target's committed card would add, if weighed
 * @returns The thresholds met
 */
export function recallBlow(
  view: GameState,
  attackValue: number,
  target: UnitInstance,
  modifiers?: Modifier[],
): AttackResult {
  const { blows } = memoryOf(view);
  const key = `${unitKey(target)}|${attackValue}|${modifiersKey(modifiers)}`;
  let result = blows.get(key);
  if (result === undefined) {
    result = applyAttackValue(view, attackValue, target, modifiers);
    blows.set(key, result);
  }
  return result;
}
