// Routes. An attack-apply sits on the ranged attack resolution, or on either
// side of a melee resolution.

// Attack-apply on the current ranged attack.
export { getRangedAttackApplyState } from './getRangedAttackApplyState';

// The attack-apply a resolution context names, for an event that carries one.
export { getAttackApplyStateAt } from './getAttackApplyStateAt';
export type { AttackApplyLocation } from './getAttackApplyStateAt';

// Attack-apply for one side of the current melee.
export { getMeleeAttackApplyState } from './getMeleeAttackApplyState';

// Selection. A rule of the game decides which candidate is answered about.

// The melee attack-apply still to close, in the order the blows take effect.
export { findNextMeleeAttackApplyToClose } from './findNextMeleeAttackApplyToClose';

// The defender whose melee attack-apply is still open, initiative first.
export { findNextMeleeDefendingPlayer } from './findNextMeleeDefendingPlayer';
