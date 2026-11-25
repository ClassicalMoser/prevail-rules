/**
 * Whether a list fields no more copies of a unit type than the type's own
 * limit (§3.1.4). This holds in every mode.
 *
 * @param count - How many copies of the type the list fields
 * @param limit - The most copies the type allows
 * @returns Whether the list keeps to the type's limit
 */
export function isWithinUnitTypeLimit(count: number, limit: number): boolean {
  // The type's printed limit is the most copies one army may field (§3.1.4);
  // fielding exactly that many is allowed.
  const withinLimit = count <= limit;

  // Whether the list fields no more of the type than it allows.
  return withinLimit;
}
