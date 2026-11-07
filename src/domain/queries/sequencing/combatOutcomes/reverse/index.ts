// Routes. A reverse sits on an attack apply, reached through the ranged attack
// or through either side of a melee.

// Reverse stored on an attack-apply.
export { getReverseStateFromAttackApply } from './getReverseStateFromAttackApply';

// Reverse on the ranged attack's apply.
export { getRangedAttackReverseState } from './getRangedAttackReverseState';

// Reverse on one side of the melee's apply.
export { getMeleeReverseState } from './getMeleeReverseState';

// Selection. A rule of the game decides which candidate is answered about.

// The reverse still open in the current melee, initiative first.
export { getNextMeleeReverseState } from './getNextMeleeReverseState';
