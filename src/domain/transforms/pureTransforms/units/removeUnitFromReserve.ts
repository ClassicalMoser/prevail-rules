import type { Board, UnitInstance } from '@entities';
import type { GameStateWithBoard } from '@game';
import { hasUnitInSet, setWithoutUnit } from '@queries';

export function removeUnitFromReserve<TBoard extends Board>(
  gameState: GameStateWithBoard<TBoard>,
  unit: UnitInstance,
): GameStateWithBoard<TBoard> {
  if (!hasUnitInSet(gameState.reservedUnits, unit)) {
    throw new Error('Unit not present in reserve');
  }
  const newReservedUnits = setWithoutUnit(gameState.reservedUnits, unit);
  return {
    ...gameState,
    reservedUnits: newReservedUnits,
  };
}
