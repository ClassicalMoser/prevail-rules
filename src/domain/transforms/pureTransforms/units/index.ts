export { addUnitsToCommandedUnits } from './addUnitsToCommandedUnits';

// Complete writers: each changes the board, the lists and the unit's entry in
// the index in one write.
export { deployUnit } from './deployUnit';
export { moveUnitIntoEngagement } from './moveUnitIntoEngagement';
export { moveUnitOnBoard } from './moveUnitOnBoard';
export { routUnit } from './routUnit';
export { removeUnitsLeavingUnderRout } from './removeUnitsLeavingUnderRout';

// Shared steps on a bare board, composed by the writers above. A board has no
// index, so these cannot leave one behind; a board reaches a game state only
// through a writer.
export { addUnitToBoard } from './addUnitToBoard';
// An engaging unit set down with the enemy it engages, the enemy turned to face it.
export { addEngagingUnitToBoard } from './addEngagingUnitToBoard';
export { removeUnitFromBoard } from './removeUnitFromBoard';
