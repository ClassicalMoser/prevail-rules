// Apply a melee attack total.
export type { ResolveMeleeEvent } from './resolveMelee';
export {
  RESOLVE_MELEE_EFFECT_TYPE,
  resolveMeleeEventSchema,
} from './resolveMelee';

// Apply a ranged attack total.
export { RESOLVE_RANGED_ATTACK_EFFECT_TYPE } from './resolveRangedAttack';
export type { ResolveRangedAttackEvent } from './resolveRangedAttack';
export { resolveRangedAttackEventSchema } from './resolveRangedAttack';

// Finish applying that attack's defense result.
export { COMPLETE_ATTACK_APPLY_EFFECT_TYPE } from './completeAttackApply';
export type { CompleteAttackApplyEvent } from './completeAttackApply';
export { completeAttackApplyEventSchema } from './completeAttackApply';

// Finish one melee engagement.
export { COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE } from './completeMeleeResolution';
export type { CompleteMeleeResolutionEvent } from './completeMeleeResolution';
export { completeMeleeResolutionEventSchema } from './completeMeleeResolution';

// Finish a ranged-attack command.
export { COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE } from './completeRangedAttackCommand';
export type { CompleteRangedAttackCommandEvent } from './completeRangedAttackCommand';
export { completeRangedAttackCommandEventSchema } from './completeRangedAttackCommand';
