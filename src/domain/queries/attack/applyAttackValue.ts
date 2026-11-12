import type { AttackResult, Modifier, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getCurrentUnitStat } from '@queries/unit';

/**
 * Applies an attack value to a unit and returns the result.
 * @param gameState - The current game state.
 * @param attackValue - The attack value to apply: the raw sum of Attack and
 * support, floored here at zero.
 * @param unit - The unit to apply the attack value to.
 * @param defendingModifiers - Additional modifiers to apply to the unit.
 * Usually used for commitment modifiers.
 * @returns The result of the attack.
 */
export function applyAttackValue(
  gameState: GameState,
  attackValue: number,
  unit: UnitInstance,
  defendingModifiers?: Modifier[],
): AttackResult {
  // Get the defensive stats of the unit
  const currentRoutValue = getCurrentUnitStat(
    unit,
    'rout',
    gameState,
    defendingModifiers,
  );
  const currentRetreatValue = getCurrentUnitStat(
    unit,
    'retreat',
    gameState,
    defendingModifiers,
  );
  const currentReverseValue = getCurrentUnitStat(
    unit,
    'reverse',
    gameState,
    defendingModifiers,
  );

  // The attack value is finished here, so this is where it floors at zero
  // (§7.1.4): an attack value that sums below zero still meets a threshold of 0.
  const finishedAttackValue = Math.max(0, attackValue);

  // Check if the unit is routed, retreated, or reversed
  const unitRouted = finishedAttackValue >= currentRoutValue;
  const unitRetreated = finishedAttackValue >= currentRetreatValue;
  const unitReversed = finishedAttackValue >= currentReverseValue;

  // Return the result
  return {
    unitRetreated,
    unitReversed,
    unitRouted,
  };
}
