// Melee or ranged: which attack this defense result belongs to.
export {
  ATTACK_RESOLUTION_CONTEXT_VALUES,
  attackResolutionContextSchema,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from './attackResolutionContext';
export type { AttackResolutionContext } from './attackResolutionContext';

// Defender retreats.
export { RESOLVE_RETREAT_EFFECT_TYPE } from './resolveRetreat';
export type { ResolveRetreatEvent } from './resolveRetreat';
export { resolveRetreatEventSchema } from './resolveRetreat';

// Defender is turned around.
export { RESOLVE_REVERSE_EFFECT_TYPE } from './resolveReverse';
export type { ResolveReverseEvent } from './resolveReverse';
export { resolveReverseEventSchema } from './resolveReverse';

// Defender routs, and where that rout came from.
export { RESOLVE_ROUT_EFFECT_TYPE } from './resolveRout';
export type { ResolveRoutEvent } from './resolveRout';
export { resolveRoutEventSchema } from './resolveRout';

// A failed retreat becomes a rout.
export { TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE } from './triggerRoutFromRetreat';
export type { TriggerRoutFromRetreatEvent } from './triggerRoutFromRetreat';
export {
  triggerRoutFromRetreatEventSchema,
  triggerRoutFromRetreatMeleeSchema,
  triggerRoutFromRetreatRangedAttackSchema,
  triggerRoutFromRetreatSharedFieldsSchema,
} from './triggerRoutFromRetreat';

// An attack apply opens a still-pending outcome when that step's turn comes.
export { OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE } from './openRoutFromAttackApply';
export type { OpenRoutFromAttackApplyEvent } from './openRoutFromAttackApply';
export { openRoutFromAttackApplyEventSchema } from './openRoutFromAttackApply';

export { OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE } from './openRetreatFromAttackApply';
export type { OpenRetreatFromAttackApplyEvent } from './openRetreatFromAttackApply';
export { openRetreatFromAttackApplyEventSchema } from './openRetreatFromAttackApply';

export { OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE } from './openReverseFromAttackApply';
export type { OpenReverseFromAttackApplyEvent } from './openReverseFromAttackApply';
export { openReverseFromAttackApplyEventSchema } from './openReverseFromAttackApply';
