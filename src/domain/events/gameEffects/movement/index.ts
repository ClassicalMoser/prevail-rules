// Finish moving one unit along a movement command.
export { COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE } from './completeUnitMovement';
export type { CompleteUnitMovementEvent } from './completeUnitMovement';
export { completeUnitMovementEventSchema } from './completeUnitMovement';

// Finish the movement command itself.
export { COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE } from './completeMovementCommand';
export type { CompleteMovementCommandEvent } from './completeMovementCommand';
export { completeMovementCommandEventSchema } from './completeMovementCommand';

// A moving unit has entered an enemy space.
export { START_ENGAGEMENT_EFFECT_TYPE } from './startEngagement';
export type { StartEngagementEvent } from './startEngagement';
export { startEngagementEventSchema } from './startEngagement';

// Resolve a flank contact created by that move.
export { RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE } from './resolveFlankEngagement';
export type { ResolveFlankEngagementEvent } from './resolveFlankEngagement';
export { resolveFlankEngagementEventSchema } from './resolveFlankEngagement';

// Offer retreat after an engagement during movement.
export { RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE } from './resolveEngageRetreatOption';
export type { ResolveEngageRetreatOptionEvent } from './resolveEngageRetreatOption';
export { resolveEngageRetreatOptionEventSchema } from './resolveEngageRetreatOption';
