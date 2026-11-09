// A game both sides can play: units placed, hands dealt.
export { createPlayableGame } from './createPlayableGame';

// The initiative holder carrying out a Move order, one unit at a time.
export { resolvingMoveOrder } from './resolvingMoveOrder';

// Lets the game run its owed effects until a player must decide.
export { applyEffectsUntilChoice } from './applyEffectsUntilChoice';

// A Move order played up to the point where the move is written.
export { readyToWriteMove } from './readyToWriteMove';
