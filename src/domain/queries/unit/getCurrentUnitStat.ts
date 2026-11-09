import type { Modifier, UnitInstance, UnitStatName } from '@entities';
import type { GameState } from '@game';
import { getRawUnitStat } from './getRawUnitStat';

/**
 * A unit's current stat: its printed value with every modifier that applies,
 * and never below zero (§7.1.4). The floor is applied here, once, to the
 * finished stat; a Reverse threshold pushed below zero counts as 0, and a
 * Range pushed below zero means the unit cannot shoot.
 *
 * A caller that adds more before its total is finished — the attack value,
 * which adds support — sums {@link getRawUnitStat} instead and floors its
 * own total.
 *
 * @param unit - The unit to get the stat value of.
 * @param stat - The stat to get the value of.
 * @param gameState - The current game state.
 * @param modifiers - Additional modifiers to apply to the stat.
 * Usually used for commitment modifiers.
 * @returns The current stat value of the unit, zero or more.
 */
export function getCurrentUnitStat(
  unit: UnitInstance,
  stat: UnitStatName,
  gameState: GameState,
  modifiers?: Modifier[],
): number {
  // The raw sum may go negative; no stat in the game does (§7.1.4).
  const rawStat = getRawUnitStat(unit, stat, gameState, modifiers);
  const currentStat = Math.max(0, rawStat);
  return currentStat;
}
