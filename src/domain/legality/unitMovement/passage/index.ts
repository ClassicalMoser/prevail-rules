// Whether a move may end on a space: open ground yes, a friend never, an
// enemy only as a legal engagement (§5.3).
export { canMoveInto } from './canMoveInto';

// Whether a move may go on through a space: open ground, or a friend loose
// enough to pass (§5.4).
export { canMoveThrough } from './canMoveThrough';

// Whether a diagonal step may slip between the two corner spaces flanking it
// (§5.4.5).
export { checkDiagonalMove } from './checkDiagonalMove';
