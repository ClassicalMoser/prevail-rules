import type { Army, GameModeName } from '@entities';
import {
  countCommandCardsByInitiative,
  getArmyCost,
  getArmyMorale,
} from '@queries';

import {
  armyCompositionByMode,
  armyCompositionInitiatives,
} from './armyComposition';
import {
  isWithinMaxArmyCost,
  isWithinMaxUnitTypeCount,
  meetsCardsPerInitiative,
  meetsMinMoraleValue,
} from './limits';

/**
 * Where an army stands against one limit of its game mode: what it holds,
 * what the mode allows, and whether it keeps to it.
 */
export interface ArmyLimitStatus<V = number> {
  /** What the army holds: a total, or a count for each initiative. */
  value: V;
  /** What the mode sets, or `null` where it sets nothing (Tutorial). */
  limit: number | null;
  /** Whether the army keeps to the limit; always true where none is set. */
  met: boolean;
}

/**
 * An army against each of the four limits its mode sets on a list (§3.1.3):
 * how many unit types it fields, what it costs, the Morale it carries, and
 * how its cards spread across initiative.
 */
export interface ArmyCompositionStatus {
  /** Different unit types fielded, against the mode's most (§3.1.3). */
  unitTypeCount: ArmyLimitStatus;
  /** Units and cards together, against the mode's cost cap (§3.1.3). */
  cost: ArmyLimitStatus;
  /** Total Morale, against the mode's floor (§3.1.6). */
  morale: ArmyLimitStatus;
  /** Cards at each initiative, each against the mode's exact count (§3.1.7). */
  cardsPerInitiative: ArmyLimitStatus<Record<number, number>>;
}

/**
 * How an army list measures against each limit of a game mode (§3.1.3).
 * One reading serves both the army check, which reports each limit not
 * met, and a list builder, which shows the totals beside the limits; so
 * the two cannot disagree about whether a list is legal.
 *
 * @param army - The army list
 * @param mode - The game mode it is built for
 * @returns Each limit with the army's value, the mode's limit, and whether it is met
 */
export function getArmyCompositionStatus(
  army: Army,
  mode: GameModeName,
): ArmyCompositionStatus {
  const rules = armyCompositionByMode[mode];

  // Every mode caps how many different unit types a list may field.
  const unitTypeCountValue = army.units.length;
  const unitTypeCount: ArmyLimitStatus = {
    limit: rules.maxUnitTypeCount,
    met: isWithinMaxUnitTypeCount(unitTypeCountValue, rules.maxUnitTypeCount),
    value: unitTypeCountValue,
  };

  // Units and cards are bought from the same points, up to the cap; a mode
  // without a cap is met by any cost.
  const costValue = getArmyCost(army);
  const cost: ArmyLimitStatus = {
    limit: rules.maxArmyCost,
    met: isWithinMaxArmyCost(costValue, rules.maxArmyCost),
    value: costValue,
  };

  // Somebody in the list has to matter: total Morale must reach the floor
  // (§3.1.6). A mode without a floor is met by any Morale.
  const moraleValue = getArmyMorale(army);
  const morale: ArmyLimitStatus = {
    limit: rules.minMoraleValue,
    met: meetsMinMoraleValue(moraleValue, rules.minMoraleValue),
    value: moraleValue,
  };

  // No army can be built to always go first: the same number of cards at
  // every initiative value, exactly (§3.1.7). A mode without a spread is met
  // by any hand.
  const counts = countCommandCardsByInitiative(army);
  const { cardsPerInitiative: required } = rules;
  const balanced = armyCompositionInitiatives.every((initiative) =>
    meetsCardsPerInitiative(counts[initiative], required),
  );
  const cardsPerInitiative: ArmyLimitStatus<Record<number, number>> = {
    limit: required,
    met: balanced,
    value: counts,
  };

  // The four limits of §3.1.3, each measured once.
  const status: ArmyCompositionStatus = {
    cardsPerInitiative,
    cost,
    morale,
    unitTypeCount,
  };
  return status;
}
