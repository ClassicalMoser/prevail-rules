// A melee is fought: what each side's attack reached against the other unit.
export { generateResolveMeleeEvent } from './generateResolveMeleeEvent';
// A shot is measured: what it reached against its target.
export { generateResolveRangedAttackEvent } from './generateResolveRangedAttackEvent';
// An attack's results are all carried out, and its apply closes.
export { generateCompleteAttackApplyEvent } from './generateCompleteAttackApplyEvent';
// One melee is over, and the next may be chosen.
export { generateCompleteMeleeResolutionEvent } from './generateCompleteMeleeResolutionEvent';
// One shot of a Shoot order is over, and the next shooter may be chosen.
export { generateCompleteRangedAttackEvent } from './generateCompleteRangedAttackEvent';
// A Shoot order ends, no shooter being left to choose.
export { generateCompleteRangedAttackCommandEvent } from './generateCompleteRangedAttackCommandEvent';
