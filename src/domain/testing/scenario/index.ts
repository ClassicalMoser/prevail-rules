// A game both sides can play: units placed, hands dealt.
export { createPlayableGame } from './createPlayableGame';

// The initiative holder carrying out a Move order, one unit at a time.
export { resolvingMoveOrder } from './resolvingMoveOrder';

// Lets the game run its owed effects until a player must decide.
export { applyEffectsUntilChoice } from './applyEffectsUntilChoice';

// A Move order played up to the point where the move is written.
export { readyToWriteMove } from './readyToWriteMove';

// The initiative holder carrying out a Shoot order, one shot at a time.
export { resolvingShootOrder } from './resolvingShootOrder';

// A Shoot order played up to the point where the shot is aimed.
export { readyToAimShot } from './readyToAimShot';
