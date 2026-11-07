// Route. A reverse sits on an attack-apply and nowhere else, so there is one.

// Reverse stored on an attack-apply.
export { getReverseStateFromAttackApply } from './getReverseStateFromAttackApply';

// Selection. A rule of the game decides which candidate is answered about.

// The reverse still open in the current melee, initiative first.
export { getReverseStateFromMeleeResolutionByInitiative } from './getReverseStateFromMeleeResolutionByInitiative';
