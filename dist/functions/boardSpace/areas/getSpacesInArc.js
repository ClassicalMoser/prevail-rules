import { getFrontSpaces } from "../adjacency/getFrontSpaces.js";
import { filterUndefinedSpaces } from "../index.js";
export function getSpacesInArc(board, coordinate, facing, range) {
    // Start with the origin space
    const spacesInArc = new Set([coordinate]);
    // Add the spaces in front of the origin space
    for (let i = 0; i < range; i++) {
        // Iterate forward by spaces in front, up to the range.
        const currentSpacesInArc = [...spacesInArc];
        for (const space of currentSpacesInArc) {
            // Get the spaces in front of the current space
            const spacesInFront = getFrontSpaces(board, space, facing);
            // Add the spaces in front of the current space to the set
            for (const space of spacesInFront) {
                spacesInArc.add(space);
            }
        }
    }
    // Remove the origin space
    spacesInArc.delete(coordinate);
    // Filter out undefined values
    const validSpacesInArc = filterUndefinedSpaces(spacesInArc);
    // Return the set of valid spaces in the arc
    return validSpacesInArc;
}
