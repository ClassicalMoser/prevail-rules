// The shape of one mode's limits on a list (§3.1.3).
export type { ArmyCompositionRules } from './armyComposition';
// Each mode's limits on a list, and the initiative values a spread is counted over.
export {
  armyCompositionByMode,
  armyCompositionInitiatives,
} from './armyComposition';
// How a list measures against each limit of its mode, for the refine and a list builder.
export { getArmyCompositionStatus } from './getArmyCompositionStatus';
// One limit as measured, and all four together.
export type {
  ArmyCompositionStatus,
  ArmyLimitStatus,
} from './getArmyCompositionStatus';
// The mode's limits as Zod issues, and an army schema that adds them for one mode.
export {
  armySchemaForMode,
  refineArmyComposition,
} from './refineArmyComposition';
// The rules every army keeps in every mode, as Zod issues and as a schema.
export { legalArmySchema, refineArmyRules } from './refineArmyRules';
// Each limit on a list, checked one value at a time: the army check and a list
// builder's row-by-row display read the same comparison.
export {
  isWithinMaxArmyCost,
  isWithinMaxUnitTypeCount,
  isWithinUnitTypeLimit,
  meetsCardsPerInitiative,
  meetsMinMoraleValue,
} from './limits';
