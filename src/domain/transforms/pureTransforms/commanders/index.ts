// Complete writers: each changes the board, the lists and the commander's
// entry in the index in one write.
export { carryRidingCommander } from './carryRidingCommander';
export { defeatCommander } from './defeatCommander';
export { defeatCommanderWithRoutedUnit } from './defeatCommanderWithRoutedUnit';
export { deployCommander } from './deployCommander';
export { moveCommanderOnBoard } from './moveCommanderOnBoard';

// Shared steps on a bare board, composed by the writers above.
export { addCommanderToBoard } from './addCommanderToBoard';
export { removeCommanderFromBoard } from './removeCommanderFromBoard';
