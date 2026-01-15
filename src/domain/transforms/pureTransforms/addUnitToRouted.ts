import type { Board, GameState, UnitInstance } from '@entities';

/* Pure transform to add a unit to the routed units set immutably with no side effects. */
export function addUnitToRouted<TBoard extends Board>(
  gameState: GameState<TBoard>,
  unit: UnitInstance,
): GameState<TBoard> {
  if (gameState.routedUnits.has(unit)) {
    throw new Error('Unit already routed');
  }
  const newRoutedUnits = new Set([...gameState.routedUnits, unit]);
  return {
    ...gameState,
    routedUnits: newRoutedUnits,
  };
}
