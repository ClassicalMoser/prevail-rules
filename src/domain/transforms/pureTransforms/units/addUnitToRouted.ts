import type { Board, UnitInstance } from '@entities';
import type { GameStateWithBoard } from '@game';
import { hasUnitInSet } from '@queries';

/* Pure transform to add a unit to the routed units set immutably with no side effects. */
export function addUnitToRouted<TBoard extends Board>(
  gameState: GameStateWithBoard<TBoard>,
  unit: UnitInstance,
): GameStateWithBoard<TBoard> {
  if (hasUnitInSet(gameState.routedUnits, unit)) {
    throw new Error('Unit already routed');
  }
  const newRoutedUnits = new Set([...gameState.routedUnits, unit]);
  return {
    ...gameState,
    routedUnits: newRoutedUnits,
  };
}
