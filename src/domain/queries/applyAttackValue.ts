import type {
  AttackResult,
  Board,
  GameState,
  Modifier,
  UnitInstance,
} from '@entities';
import { getCurrentUnitStat } from './getCurrentUnitStat';

/**
 * Applies an attack value to a unit and returns the result.
 * @param gameState - The current game state.
 * @param attackValue - The attack value to apply.
 * @param unit - The unit to apply the attack value to.
 * @param defendingModifiers - Additional modifiers to apply to the unit.
 * Usually used for commitment modifiers.
 * @returns The result of the attack.
 */
export function applyAttackValue<TBoard extends Board>(
  gameState: GameState<TBoard>,
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
