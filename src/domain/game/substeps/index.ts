// Command resolution (issueCommands)
export {
  commandResolutionStateSchema,
  movementResolutionStateSchema,
  rangedAttackResolutionStateSchema,
} from './commandResolution';
export type {
  CommandResolutionState,
  MovementResolutionState,
  RangedAttackResolutionState,
} from './commandResolution';

// Melee resolution (resolveMelee)
export { meleeResolutionStateSchema } from './meleeResolution';
export type { MeleeResolutionState } from './meleeResolution';

// Rally (cleanup)
export { rallyResolutionStateSchema } from './rallyResolution';
export type { RallyResolutionState } from './rallyResolution';

// Shared combat outcomes
export {
  attackResultSchema,
  attackApplyStateSchema,
  retreatStateSchema,
  reverseStateSchema,
  routStateSchema,
} from './combatOutcomes';
export type {
  AttackResult,
  AttackApplyState,
  RetreatState,
  ReverseState,
  RoutState,
} from './combatOutcomes';

// Engagement (under movement)
export {
  engagementResolutionStateSchema,
  engagementStateSchema,
  flankEngagementResolutionStateSchema,
  frontEngagementResolutionStateSchema,
  rearEngagementResolutionStateSchema,
} from './engagement';
export type {
  EngagementResolutionState,
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  RearEngagementResolutionState,
} from './engagement';
