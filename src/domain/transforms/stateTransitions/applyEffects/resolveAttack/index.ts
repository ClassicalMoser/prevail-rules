// A shot is measured, and the target's results are recorded as due.
export { applyResolveRangedAttackEvent } from './applyResolveRangedAttackEvent';
// A melee is measured, and both units' results are recorded as due.
export { applyResolveMeleeEvent } from './applyResolveMeleeEvent';
// One unit's results are all carried out, and its apply closes.
export { applyCompleteAttackApplyEvent } from './applyCompleteAttackApplyEvent';
// One shot of a Shoot order is finished.
export { applyCompleteRangedAttackEvent } from './applyCompleteRangedAttackEvent';
// A Shoot order ends, and the player's orders with it.
export { applyCompleteRangedAttackCommandEvent } from './applyCompleteRangedAttackCommandEvent';
// One melee is finished, and the next may be chosen.
export { applyCompleteMeleeResolutionEvent } from './applyCompleteMeleeResolutionEvent';
