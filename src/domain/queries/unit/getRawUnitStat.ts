import type { Modifier, UnitInstance, UnitStatName } from '@entities';
import type { GameState } from '@game';
import { findCardInPlay } from '@queries/card';
import { isDefenseStat } from './isDefenseStat';
import { unitMatchesInspirationRange } from './unitMatchesInspirationRange';
import { unitTypeMatchesRestrictions } from './unitTypeMatchesRestrictions';
import { hasUnitInArray } from './hasUnitInArray';

/**
 * A unit's stat as the raw sum of its printed value and every modifier that
 * applies, before the floor at zero (§7.1.4).
 *
 * Most callers want {@link getCurrentUnitStat}, the finished stat. This raw
 * sum is for a caller that adds more to the stat before the total is done:
 * the attack value is a unit's Attack plus its support, and is floored once,
 * as a whole, so a negative Attack cannot hit zero early and have support
 * rebound it above the raw arithmetic.
 *
 * @param unit - The unit to get the stat value of.
 * @param stat - The stat to get the value of.
 * @param gameState - The current game state.
 * @param modifiers - Additional modifiers to apply to the stat.
 * Usually used for commitment modifiers.
 * @returns The stat's raw sum, which may be negative.
 */
export function getRawUnitStat(
  unit: UnitInstance,
  stat: UnitStatName,
  gameState: GameState,
  modifiers?: Modifier[],
): number {
  // Get the base stat value
  const baseStat = unit.unitType.stats[stat];
  // Check if the stat is a defense stat
  const statIsDefense = isDefenseStat(stat).result;
  // Get the side of the unit
  const unitSide = unit.playerSide;

  // Get the active card
  const activeCard = findCardInPlay(gameState.cardState, unitSide);

  // Four modifier sources, in this order:
  // 1. Terrain. Not implemented; this step adds nothing.
  // 2. The in-play card's round effect, when the unit meets its restrictions.
  // 3. The in-play card's command modifiers, and only if this unit was commanded.
  // 4. Extra modifiers passed in, such as a commitment.

  /**
   * Helper function to find a matching modifier in an array of modifiers.
   */
  const findMatchingModifier = (modifierList: Modifier[]) =>
    modifierList.find(
      (modifier) =>
        modifier.type === stat ||
        (statIsDefense && modifier.type === 'defense'),
    );

  // Step 1: Terrain (not yet implemented)

  // Step 2: Round effect
  const activeRoundEffect = activeCard?.roundEffect;
  let totalModifier = 0;

  // First check if there is a matching modifier in the round effect
  if (activeRoundEffect) {
    const matchingModifier = findMatchingModifier(activeRoundEffect.modifiers);
    // If there is a matching modifier, check if the unit satisfies the restrictions
    if (matchingModifier) {
      // The card's range must reach the unit; one printed unrestricted always does.
      const inRange = unitMatchesInspirationRange(
        unit,
        activeRoundEffect.restrictions,
        gameState,
      );
      // The card may also name a trait or unit type the unit must be.
      const ofNamedType = unitTypeMatchesRestrictions(
        unit.unitType,
        activeRoundEffect.restrictions,
      );

      // Only a unit the card reaches and names takes the modifier.
      if (inRange && ofNamedType) {
        totalModifier += matchingModifier.value;
      }
    }
  }

  // Step 3: Active command.
  // These apply only to a commanded unit.
  // They do not re-check the round-effect restrictions.
  const activeCommandModifiers = activeCard?.command.modifiers ?? [];
  // First check if the unit was commanded
  const { commandedUnits } = gameState.currentRoundState;
  const unitWasCommanded = hasUnitInArray(commandedUnits, unit);

  // If the unit was commanded, check if there is a matching modifier
  if (unitWasCommanded) {
    const matchingModifier = findMatchingModifier(activeCommandModifiers);
    // If there is, add the modifier to the total
    if (matchingModifier) {
      totalModifier += matchingModifier.value;
    }
  }

  // Step 4: Additional modifiers
  if (modifiers) {
    const matchingModifier = findMatchingModifier(modifiers);
    if (matchingModifier) {
      totalModifier += matchingModifier.value;
    }
  }

  const rawStat = baseStat + totalModifier;
  return rawStat;
}
