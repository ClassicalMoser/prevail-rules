// A standard board with these units set down, in order.
export { createBoardWithUnits } from './boardWithUnits';

// A standard board with one unit on it, chosen by a stat.
export { createBoardWithSingleUnit } from './boardWithSingleUnit';

// A standard board with two enemy units engaged in one space.
export { createBoardWithEngagedUnits } from './boardWithEngagedUnits';

// A rank of one side's units, all facing one way, and a reader for each.
export { createBoardWithFacingRow } from './boardWithFacingRow';

// A board with a commander on a space, where its ranges are measured from.
export { createBoardWithCommander } from './boardWithCommander';

// A new standard game around a board a spec built.
export { createGameStateWithBoard } from './gameStateWithBoard';

// A new standard game with these units on its board.
export { createGameStateWithUnits } from './gameStateWithUnits';

// A new standard game with one unit on its board.
export { createGameStateWithSingleUnit } from './gameStateWithSingleUnit';

// A new standard game with two units engaged on its board.
export { createGameStateWithEngagedUnits } from './gameStateWithEngagedUnits';
