// A command a spec can shape, Move for one unit by default.
export { createTestCommand } from './createTestCommand';

// A fresh, parseable card a spec can shape, and the options it takes.
export type { CreateTestCardOptions } from './createTestCard';
export { createTestCard } from './createTestCard';

// Stand-in cards from the catalog, by position or by how many.
export { getCards } from './getCards';
export { getCardsByCount } from './getCardsByCount';

// A game's whole card state swapped, for setup only.
export { updateCardState } from './updateCardState';

// A stand-in unit with where it stands, built from stat options.
export { createUnitWithPlacement } from './createUnitWithPlacement';

// A unit a spec already has, put at a space and facing.
export { placed } from './placed';

// Whether any legal move ends on a space, in a facing if named.
export { hasMove } from './hasMove';

// Where each unit of a line's stretch stands.
export { coordinatesOfSegment } from './lineCoordinates';

// Every retreat the rules offer a unit, on a board around it.
export { legalRetreatsOf } from './legalRetreatsOf';

// An enemy behind a unit, facing it: its retreat is cut off.
export { enemyCuttingOffRetreat } from './enemyCuttingOffRetreat';

// An enemy behind a unit, facing away: only its straight step back is barred.
export { enemyBlockingStraightBack } from './enemyBlockingStraightBack';
