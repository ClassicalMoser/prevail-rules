// The two applies in the order their results take effect (§7.5.6).
export { getMeleeAppliesInResolutionOrder } from './getMeleeAppliesInResolutionOrder';

// The melee currently being resolved.
export { getMeleeResolutionState } from './getMeleeResolutionState';

// The same, `undefined` between one melee and the next.
export { findMeleeResolutionState } from './findMeleeResolutionState';

// Both commitments are done, and attack-apply has not opened yet.
export { getMeleeResolutionReadyForAttackCalculation } from './getMeleeResolutionReadyForAttackCalculation';

// Spaces still waiting for a melee this phase.
export { getRemainingMeleeEngagements } from './getRemainingMeleeEngagements';
