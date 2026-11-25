import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { throwIfUndefined } from '@utils';
import { isSameUnitInstance } from './unitEquivalence';

/**
 * The reserve's own copy of a unit, found by who it is. Its stats are the
 * ones the army brought, whatever copy named it.
 *
 * @param gameState - The game, for its reserve
 * @param unit - The unit, by who it is
 * @returns The reserve's own unit
 * @throws {Error} If the unit is not in reserve
 */
export function getReservedUnit(
  gameState: GameState,
  unit: UnitInstance,
): UnitInstance {
  // Matched on who it is, not on the stats the name carries.
  const held = throwIfUndefined(
    gameState.reservedUnits.find((member) => isSameUnitInstance(member, unit)),
    'Unit not present in reserve',
  );
  return held;
}
