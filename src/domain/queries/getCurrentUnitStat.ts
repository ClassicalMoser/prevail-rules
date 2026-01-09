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
import { getSpacesWithinDistance } from './boardSpace';
import { getCommanderSpace } from './getCommanderSpace';
import { getPositionOfUnit } from './unitPresence';

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
    if (matchingModifier) {
      let satisfiesAllRestrictions = true;
      let satisfiesInspirationRangeRestriction = false;
      let satisfiesUnitRestrictions = true;
      const inspirationRange =
        activeRoundEffect.restrictions.inspirationRangeRestriction;
      if (inspirationRange) {
        const unitPlacement = getPositionOfUnit(gameState.boardState, unit);
        if (!unitPlacement) {
          throw new Error('Unit not found on board');
        }
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
