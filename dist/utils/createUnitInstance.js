/** Basic utility function to create a unit instance with a specific stat value.
 * This helps to write tests that consider unit values without making
 * them too brittle.
 */
export function createUnitInstance(playerSide, unitType, instanceNumber) {
    return { playerSide, unitType, instanceNumber };
}
