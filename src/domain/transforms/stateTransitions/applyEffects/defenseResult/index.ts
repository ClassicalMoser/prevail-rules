// An attack drove a unit back, and its retreat opens with the ways it may go.
export { applyOpenRetreatFromAttackApplyEvent } from './applyOpenRetreatFromAttackApplyEvent';
// A unit falls back along its retreat, its commander with it.
export { applyResolveRetreatEvent } from './applyResolveRetreatEvent';
// A unit with nowhere to retreat routs in the retreat's place.
export { applyTriggerRoutFromRetreatEvent } from './applyTriggerRoutFromRetreatEvent';
// An attack shook a unit, and its reverse opens.
export { applyOpenReverseFromAttackApplyEvent } from './applyOpenReverseFromAttackApplyEvent';
// A unit is turned about where it stands, or holds its facing while engaged.
export { applyResolveReverseEvent } from './applyResolveReverseEvent';
// An attack broke a unit, and it leaves the board as its rout opens.
export { applyOpenRoutFromAttackApplyEvent } from './applyOpenRoutFromAttackApplyEvent';
// The Morale a rout costs is written, and a rout that costs nothing closes.
export { applyResolveRoutEvent } from './applyResolveRoutEvent';
