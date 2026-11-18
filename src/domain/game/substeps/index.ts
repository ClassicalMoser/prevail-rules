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
  attackApplyStateSchema,
  retreatStateSchema,
  reverseStateSchema,
  routStateSchema,
} from './combatOutcomes';
export type {
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

// Any substep play can be inside, and the list of their kinds
export {
  substepTypes,
  substepTypeSchema,
  COMMAND_RESOLUTION_SUBSTEP_TYPE,
  MELEE_RESOLUTION_SUBSTEP_TYPE,
  RALLY_RESOLUTION_SUBSTEP_TYPE,
  ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE,
  ATTACK_APPLY_SUBSTEP_TYPE,
  REVERSE_SUBSTEP_TYPE,
  RETREAT_SUBSTEP_TYPE,
  ROUT_SUBSTEP_TYPE,
} from './substepType';
export type { SubstepType } from './substepType';
export type { SubstepState } from './substepState';
