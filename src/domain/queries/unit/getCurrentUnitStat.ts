import type { Modifier, UnitInstance, UnitStatName } from '@entities';
import type { GameState } from '@game';
import { getCommanderSpace } from '../board/getCommanderSpace';
import { getSpacesWithinDistance } from '../board/areas/getSpacesWithinDistance';
import { getPositionOfUnit } from '../unitPresence/getPositionOfUnit';
import { isDefenseStat } from './isDefenseStat';
import { unitTypeMatchesRestrictions } from './unitTypeMatchesRestrictions';
import { hasUnitInArray } from './hasUnitInArray';

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
      let satisfiesAllRestrictions = true;
      let satisfiesInspirationRangeRestriction = false;
      let satisfiesUnitRestrictions = true;
      const inspirationRange =
        activeRoundEffect.restrictions.inspirationRangeRestriction;
      // TODO(composition): this range check repeats `unitMatchesInspirationRange`
      // in `getLegalUnitsForIssueCommand`, which reads the placement it is given
      // instead of searching the board. Settled by one helper in queries.
      // A negative range means there is no inspiration restriction.
      // Zero or more is a range, and a missing commander fails it.
      if (inspirationRange >= 0) {
        const unitPlacement = getPositionOfUnit(gameState.boardState, unit);
        const unitPosition = unitPlacement.coordinate;
        const commanderSpace = getCommanderSpace(
          unit.playerSide,
          gameState.boardState,
        );
        // A missing commander is a defeated commander.
        // The range then fails, and the round modifier is not applied.

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

      // Check if the unit satisfies the trait or unit-type filter.
      const unitType = unit.unitType;
      const restrictions = activeRoundEffect.restrictions;
      satisfiesUnitRestrictions = unitTypeMatchesRestrictions(
        unitType,
        restrictions,
      );

      // Combine the existing restriction satisfaction with the new one.
      satisfiesAllRestrictions &&= satisfiesUnitRestrictions;

      // If the unit satisfies the restrictions, add the modifier to the total
      if (satisfiesAllRestrictions) {
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

  const currentStat = baseStat + totalModifier;
  return currentStat;
}
