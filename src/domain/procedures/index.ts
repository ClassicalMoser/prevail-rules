// The one entry point for every game effect: the expected engine names the
// effect owed, and this builds its event from the state.
export { generateEventFromProcedure } from './procedureRegistry';
// The engagement a move into an enemy starts. Play builds it through the
// registry; `applyMoveUnitEvent`'s spec imports it to read the engagement a
// move it applied would open.
export { generateStartEngagementEvent } from './movement';
