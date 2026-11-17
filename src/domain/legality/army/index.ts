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
