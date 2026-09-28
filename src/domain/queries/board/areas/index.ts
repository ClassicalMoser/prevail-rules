// The line perpendicular to a facing, including the origin.
export { getInlineSpaces } from './getInlineSpaces';

// Spaces directly ahead, then the inline line through them, then forward to the edge.
export { getHalfPlaneInDirection } from './getHalfPlaneInDirection';

// Half-plane in front of a unit.
export { getSpacesAhead } from './getSpacesAhead';

// Half-plane behind a unit.
export { getSpacesBehind } from './getSpacesBehind';

// Every space in the facing's arc out to the given range.
export { getSpacesInArc } from './getSpacesInArc';

// Every space within a given distance.
export { getSpacesWithinDistance } from './getSpacesWithinDistance';
