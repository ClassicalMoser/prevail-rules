// The next step of one unit's move under a Move order (§4.3.10).
export { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';
// The next step of one shot under a Shoot order (§4.3.11).
export { getExpectedRangedAttackResolutionEvent } from './getExpectedRangedAttackResolutionEvent';
// The next step of whichever order is being carried out, by its kind.
export { getExpectedCommandResolutionEvent } from './getExpectedCommandResolutionEvent';
// The next step of the melee being fought (§7.2.2).
export { getExpectedMeleeResolutionEvent } from './getExpectedMeleeResolutionEvent';
