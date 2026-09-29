import type { Modifier, UnitInstance, UnitStatName } from '@entities';
import type { GameState } from '@game';
import { getCommanderSpace } from '../board/getCommanderSpace';
import { getSpacesWithinDistance } from '../board/areas/getSpacesWithinDistance';
import { getPositionOfUnit } from '../unitPresence/getPositionOfUnit';
import { isDefenseStat } from './isDefenseStat';
import { matchesUnitRequirements } from './matchesUnitRequirements';
import { hasUnitInArray } from './unitArray';

/**
 * Gets the current stat value of a unit.
 * @param unit - The unit to get the stat value of.
 * @param stat - The stat to get the value of.
 * @param gameState - The current game state.
 * @param modifiers - Additional modifiers to apply to the stat.
 * Usually used for commitment modifiers.
 * @returns The current stat value of the unit.
 */
export function getCurrentUnitStat(
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
  const activeCard = gameState.cardState[unitSide].inPlay;

  // Three possible sources of modifiers:
  // 1. Terrain effects (not yet implemented)
  // 2. Round effect
  // 3. Active command effects
  // 4. Additional modifiers, such as commitment modifiers.

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
      let satisfiesAllRestrictions = true;
      let satisfiesInspirationRangeRestriction = false;
      let satisfiesUnitRestrictions = true;
      const inspirationRange =
        activeRoundEffect.restrictions.inspirationRangeRestriction;
      if (inspirationRange >= 0) {
        const unitPlacement = getPositionOfUnit(gameState.boardState, unit);
        const unitPosition = unitPlacement.coordinate;
        const commanderSpace = getCommanderSpace(
          unit.playerSide,
          gameState.boardState,
        );
        // Don't throw if commander is not on board.
        // It means the commander was defeated.

        if (commanderSpace) {
          // If the commander is on board, find all spaces within the range.
          const spacesWithinDistance = getSpacesWithinDistance(
            gameState.boardState,
            commanderSpace,
            inspirationRange,
          );

          // Check if the unit is within range.
          satisfiesInspirationRangeRestriction =
            spacesWithinDistance.has(unitPosition);
        }
        // If the range is specified, it must be satisfied.
        satisfiesAllRestrictions = satisfiesInspirationRangeRestriction;
      }

      // Check if the unit satisfies the trait restrictions.
      satisfiesUnitRestrictions = matchesUnitRequirements(
        unit.unitType,
        activeRoundEffect.restrictions.traitRestrictions,
        activeRoundEffect.restrictions.unitRestrictions,
      ).result;

      // Combine the existing restriction satisfaction with the new one.
      satisfiesAllRestrictions =
        satisfiesAllRestrictions && satisfiesUnitRestrictions;

      // If the unit satisfies the restrictions, add the modifier to the total
      if (satisfiesAllRestrictions) {
        totalModifier += matchingModifier.value;
      }
    }
  }

  // Step 3: Active command
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

  // Return the base stat plus the total modifier
  return baseStat + totalModifier;
}
