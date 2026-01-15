import type { Board, GameState, UnitInstance } from '@entities';
import { isSameUnitInstance } from '@validation';

export function removeUnitFromReserve<TBoard extends Board>(
  gameState: GameState<TBoard>,
  unit: UnitInstance,
): GameState<TBoard> {
  if (!gameState.reservedUnits.has(unit)) {
    throw new Error('Unit not present in reserve');
  }
  const newReservedUnits = new Set(
    [...gameState.reservedUnits].filter(
      (u) => !isSameUnitInstance(u, unit).result,
    ),
  );
  return {
    ...gameState,
    reservedUnits: newReservedUnits,
  };
}
