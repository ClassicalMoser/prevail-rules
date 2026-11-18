export type { ArmyCompositionRules } from './armyComposition';
export {
  armyCompositionByMode,
  armyCompositionInitiatives,
} from './armyComposition';
// How a list measures against each limit of its mode, for the refine and a list builder.
export { getArmyCompositionStatus } from './getArmyCompositionStatus';
export type {
  ArmyCompositionStatus,
  ArmyLimitStatus,
} from './getArmyCompositionStatus';
export {
  armySchemaForMode,
  refineArmyComposition,
} from './refineArmyComposition';
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
