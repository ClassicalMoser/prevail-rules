import type { AttackResult, Board, GameState, UnitInstance } from '@entities';
import { getCurrentUnitStat } from './getCurrentUnitStat';

/**
 * Applies an attack value to a unit and returns the result.
 * @param gameState - The current game state.
 * @param attackValue - The attack value to apply.
 * @param unit - The unit to apply the attack value to.
 * @returns The result of the attack.
 */
export function applyAttackValue<TBoard extends Board>(
  gameState: GameState<TBoard>,
  attackValue: number,
  unit: UnitInstance,
): AttackResult {
  // Get the defensive stats of the unit
  const currentRoutValue = getCurrentUnitStat(unit, 'rout', gameState);
  const currentRetreatValue = getCurrentUnitStat(unit, 'retreat', gameState);
  const currentReverseValue = getCurrentUnitStat(unit, 'reverse', gameState);

  // Check if the unit is routed, retreated, or reversed
  const unitRouted = attackValue >= currentRoutValue;
  const unitRetreated = attackValue >= currentRetreatValue;
  const unitReversed = attackValue >= currentReverseValue;

  // Return the result
  return {
    unitRouted,
    unitReversed,
    unitRetreated,
  };
}
