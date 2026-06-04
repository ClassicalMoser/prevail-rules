import type { Board, UnitInstance } from '@entities';
import type { GameStateForBoard } from '@game';
import { hasUnitInArray, arrayWithoutUnit } from '@queries';

export function removeUnitFromReserve<TBoard extends Board>(
  gameState: GameStateForBoard<TBoard>,
  unit: UnitInstance,
): GameStateForBoard<TBoard> {
  if (!hasUnitInArray(gameState.reservedUnits, unit)) {
    throw new Error('Unit not present in reserve');
  }
  const newReservedUnits = arrayWithoutUnit(gameState.reservedUnits, unit);
  return {
    ...gameState,
    reservedUnits: newReservedUnits,
  };
}
