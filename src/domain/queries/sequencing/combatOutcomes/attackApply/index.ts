// Routes. An attack-apply sits on the ranged attack resolution, or on either
// side of a melee resolution.

// Attack-apply on the current ranged attack.
export { getRangedAttackApplyState } from './getRangedAttackApplyState';

// Attack-apply for one side of the current melee.
export { getMeleeAttackApplyState } from './getMeleeAttackApplyState';

// Selection. A rule of the game decides which candidate is answered about.

// The defender whose melee attack-apply is still open, initiative first.
export { getNextMeleeDefendingPlayer } from './getNextMeleeDefendingPlayer';
