import type {
  Board,
  GameState,
  Modifier,
  UnitInstance,
  UnitStatName,
} from '@entities';
import {
  isDefenseStat,
  isSameUnitInstance,
  matchesUnitRequirements,
} from '@validation';

/**
 * Gets the current stat value of a unit.
 * @param unit - The unit to get the stat value of.
 * @param stat - The stat to get the value of.
 * @param gameState - The current game state.
 * @returns The current stat value of the unit.
 */
export function getCurrentUnitStat<TBoard extends Board>(
  unit: UnitInstance,
  stat: UnitStatName,
  gameState: GameState<TBoard>,
): number {
  // Get the base stat value
  const baseStat = unit.unitType.stats[stat];
  // Check if the stat is a defense stat
  const statIsDefense = isDefenseStat(stat).result;
  // Get the side of the unit
  const unitSide = unit.playerSide;
  // Get the active card
  const activeCard = gameState.cardState[`${unitSide}Player`].inPlay;

  // Three possible sources of modifiers:
  // 1. Terrain effects (not yet implemented)
  // 2. Round effect
  // 3. Active command effects

  /**
   * Helper function to find a matching modifier in an array of modifiers.
   */
  const findMatchingModifier = (
    modifiers: Modifier[],
    stat: UnitStatName,
    statIsDefense: boolean,
  ) =>
    modifiers.find(
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
    const matchingModifier = findMatchingModifier(
      activeRoundEffect.modifiers,
      stat,
      statIsDefense,
    );
    // If there is a matching modifier, check if the unit satisfies the restrictions
    // TO DO: Commander/Inspiration range restriction not yet implemented
    if (matchingModifier) {
      const satisfiesRestrictions = matchesUnitRequirements(
        unit.unitType,
        activeRoundEffect.restrictions.traitRestrictions,
        activeRoundEffect.restrictions.unitRestrictions,
      );
      // If the unit satisfies the restrictions, add the modifier to the total
      if (satisfiesRestrictions) {
        totalModifier += matchingModifier.value;
      }
    }
  }

  // Step 3: Active command
  const activeCommandModifiers = activeCard?.command.modifiers ?? [];
  // First check if the unit was commanded
  const commandedUnits = gameState.currentRoundState.commandedUnits;
  const unitWasCommanded = Array.from(commandedUnits).some(
    (commandedUnit) => isSameUnitInstance(commandedUnit, unit).result,
  );
  // If the unit was commanded, check if there is a matching modifier
  if (unitWasCommanded) {
    const matchingModifier = findMatchingModifier(
      activeCommandModifiers,
      stat,
      statIsDefense,
    );
    // If there is, add the modifier to the total
    if (matchingModifier) {
      totalModifier += matchingModifier.value;
    }
  }

  // Return the base stat plus the total modifier
  return baseStat + totalModifier;
}
