import type { Board, GameState, UnitInstance } from '@entities';
import { isSameUnitInstance } from '@validation';

export function removeUnitFromReserve<TBoard extends Board>(
  gameState: GameState<TBoard>,
  unit: UnitInstance,
): GameState<TBoard> {
  // Check for unit existence using value equality, not reference equality
  const unitExists = Array.from(gameState.reservedUnits).some(
    (u) => isSameUnitInstance(u, unit).result,
  );
  if (!unitExists) {
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
