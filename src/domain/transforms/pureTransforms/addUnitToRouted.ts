import type { Board, GameState, UnitInstance } from '@entities';
import { isSameUnitInstance } from '@validation';

/* Pure transform to add a unit to the routed units set immutably with no side effects. */
export function addUnitToRouted<TBoard extends Board>(
  gameState: GameState<TBoard>,
  unit: UnitInstance,
): GameState<TBoard> {
  // Check for unit existence using value equality, not reference equality
  const unitAlreadyRouted = Array.from(gameState.routedUnits).some(
    (u) => isSameUnitInstance(u, unit).result,
  );
  if (unitAlreadyRouted) {
    throw new Error('Unit already routed');
  }
  const newRoutedUnits = new Set([...gameState.routedUnits, unit]);
  return {
    ...gameState,
    routedUnits: newRoutedUnits,
  };
}
