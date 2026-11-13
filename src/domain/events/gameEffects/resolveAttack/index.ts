// A melee is fought: what each side's attack reached.
export type { ResolveMeleeEvent } from './resolveMelee';
export {
  RESOLVE_MELEE_EFFECT_TYPE,
  resolveMeleeEventSchema,
} from './resolveMelee';

// A shot is measured: what it reached against its target.
export { RESOLVE_RANGED_ATTACK_EFFECT_TYPE } from './resolveRangedAttack';
export type { ResolveRangedAttackEvent } from './resolveRangedAttack';
export { resolveRangedAttackEventSchema } from './resolveRangedAttack';

// Finish carrying out an attack's results.
export { COMPLETE_ATTACK_APPLY_EFFECT_TYPE } from './completeAttackApply';
export type { CompleteAttackApplyEvent } from './completeAttackApply';
export { completeAttackApplyEventSchema } from './completeAttackApply';

// Finish one melee engagement.
export { COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE } from './completeMeleeResolution';
export type { CompleteMeleeResolutionEvent } from './completeMeleeResolution';
export { completeMeleeResolutionEventSchema } from './completeMeleeResolution';

// Finish one shot of a Shoot order.
export { COMPLETE_RANGED_ATTACK_EFFECT_TYPE } from './completeRangedAttack';
export type { CompleteRangedAttackEvent } from './completeRangedAttack';
export { completeRangedAttackEventSchema } from './completeRangedAttack';

// Finish a Shoot order once no unit is left to shoot.
export { COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE } from './completeRangedAttackCommand';
export type { CompleteRangedAttackCommandEvent } from './completeRangedAttackCommand';
export { completeRangedAttackCommandEventSchema } from './completeRangedAttackCommand';
