// A move has ended on an enemy: the engagement begins, its kind read from
// the two facings.
export { generateStartEngagementEvent } from './generateStartEngagementEvent';
// A defender engaged from the flank is turned to face its attacker.
export { generateResolveFlankEngagementEvent } from './generateResolveFlankEngagementEvent';
// A defender engaged from the front is offered its retreats, if it is the faster.
export { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';
// That defender chose to fall back, and its retreat opens.
export { generateOpenRetreatFromEngagementEvent } from './generateOpenRetreatFromEngagementEvent';
// One unit's move is done, before the next unit begins.
export { generateCompleteUnitMovementEvent } from './generateCompleteUnitMovementEvent';
// The Move order is done: no unit of it is left to move.
export { generateCompleteMovementCommandEvent } from './generateCompleteMovementCommandEvent';
