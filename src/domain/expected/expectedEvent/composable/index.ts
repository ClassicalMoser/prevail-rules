// What a rout still waits on: its Morale counted, then paid (§9.3).
export { getExpectedRoutEvent } from './getExpectedRoutEvent';
// What a reverse still waits on: the turn about (§9.2).
export { getExpectedReverseEvent } from './getExpectedReverseEvent';
// What a retreat still waits on: a choice among tied ways back, the move, or the rout that takes its place (§9.1).
export { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
// What one stage of an attack's results (retreat, reverse, rout) still waits on, for one unit (§7.5.2).
export { findExpectedAttackApplyStageEvent } from './findExpectedAttackApplyStageEvent';
// What a unit's whole attack apply waits on next: its first stage with something due, then closing it.
export { getExpectedAttackApplyEvent } from './getExpectedAttackApplyEvent';
// What an engagement a move started waits on: front, flank or rear (§6.3).
export { getExpectedEngagementEvent } from './getExpectedEngagementEvent';
// What a player's rally waits on: the burn and return, the support check, and its routs (§10.3, §10.4).
export { getExpectedRallyResolutionEvent } from './getExpectedRallyResolutionEvent';
// The choice that starts carrying out the next unit's order: a mover or a shooter (§4.3.10, §4.3.11).
export { getExpectedStartCommandResolutionEvent } from './getExpectedStartCommandResolutionEvent';
