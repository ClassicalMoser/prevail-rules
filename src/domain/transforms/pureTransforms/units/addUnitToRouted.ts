import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { hasUnitInArray } from '@queries';
/* Pure transform to add a unit to the routed units set immutably with no side effects. */
export function addUnitToRouted<S extends GameState>(
  gameState: S,
  unit: UnitInstance,
): S {
  if (hasUnitInArray(gameState.routedUnits, unit)) {
    throw new Error('Unit already routed');
  }
  const newRoutedUnits = new Set([...gameState.routedUnits, unit]);
  return {
    ...gameState,
    routedUnits: [...newRoutedUnits],
  };
}
