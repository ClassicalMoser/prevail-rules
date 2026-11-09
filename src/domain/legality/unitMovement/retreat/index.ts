// Whether an enemy behind, facing the unit, has cut its retreat (§9.1.5).
export { isRetreatCutOff } from './isRetreatCutOff';

// The fewest turns, then the fewest steps, of a retreat's legal endings
// (§9.1.3).
export { getSmallestRetreats } from './getSmallestRetreats';

// Where a unit forced back by combat may fall to.
export { getLegalRetreats } from './getLegalRetreats';
