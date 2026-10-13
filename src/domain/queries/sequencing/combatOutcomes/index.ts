// Attack-apply on the current ranged attack.
export { getAttackApplyStateFromRangedAttack } from './attackApply';

// Attack-apply for one side of the current melee.
export { getAttackApplyStateFromMelee } from './attackApply';

// The defender whose melee attack-apply is still open, initiative first.
export { getDefendingPlayerForNextIncompleteMeleeAttackApply } from './attackApply';

// Reverse stored on an attack-apply.
export { getReverseStateFromAttackApply } from './reverse';

// The reverse still open in the current melee, initiative first.
export { getReverseStateFromMeleeResolutionByInitiative } from './reverse';

// Whether that reversing unit is free of the engagement.
export { canReverseUnit } from './canReverseUnit';

// Retreat stored on an attack-apply.
export { getRetreatStateFromAttackApply } from './retreat';

// Retreat on the current ranged attack.
export { getRetreatStateFromRangedAttack } from './retreat';

// Retreat for one side of the current melee.
export { getRetreatStateFromMelee } from './retreat';

// The melee retreat whose destination is chosen and whose move is not finished.
export { getRetreatStateReadyForResolveFromMelee } from './retreat';

// Retreat on the current front engagement.
export { getRetreatStateFromFrontEngagement } from './retreat';

// The retreat for one player, from ranged attack, front engagement, or melee.
export { findRetreatState } from './retreat';

// Rout stored on an attack-apply.
export { getRoutStateFromAttackApply } from './rout';

// The rout still open in the current melee, initiative first.
export { getRoutStateFromMeleeResolutionByInitiative } from './rout';

// Rout forced by the current rear engagement.
export { getRoutStateFromRearEngagement } from './getRoutStateFromRearEngagement';

// The rout that still needs a discard, from issue-commands, melee, or cleanup.
export { getAwaitingRoutDiscardState } from './getAwaitingRoutDiscardState';
