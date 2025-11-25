/**
 * Filter out undefined spaces from a set of space coordinates.
 * @param spaces - The set of space coordinates to filter
 * @returns A set of the space coordinates with undefined values removed
 */
export const filterUndefinedSpaces = (spaces) => {
    return new Set([...spaces.values()].filter((space) => space !== undefined));
};
