// Resolution union
export { engagementResolutionStateSchema } from './engagementResolutionState';
export type { EngagementResolutionState } from './engagementResolutionState';

// Engagement container
export { engagementStateSchema } from './engagementSubstep';
export type { EngagementState } from './engagementSubstep';

// The engagement once its type is known, one per kind
export type { FrontEngagementState } from './frontEngagementState';
export type { FlankEngagementState } from './flankEngagementState';
export type { RearEngagementState } from './rearEngagementState';

// By engagement type
export { flankEngagementResolutionStateSchema } from './flankEngagementResolutionSubstep';
export type { FlankEngagementResolutionState } from './flankEngagementResolutionSubstep';

export { frontEngagementResolutionStateSchema } from './frontEngagementResolutionSubstep';
export type { FrontEngagementResolutionState } from './frontEngagementResolutionSubstep';

export { rearEngagementResolutionStateSchema } from './rearEngagementResolutionSubstep';
export type { RearEngagementResolutionState } from './rearEngagementResolutionSubstep';
