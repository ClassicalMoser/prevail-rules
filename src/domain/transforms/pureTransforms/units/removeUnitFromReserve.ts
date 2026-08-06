import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { hasUnitInArray, arrayWithoutUnit } from '@queries';
export function removeUnitFromReserve(
  gameState: GameState,
  unit: UnitInstance,
): GameState {
  if (!hasUnitInArray(gameState.reservedUnits, unit)) {
    throw new Error('Unit not present in reserve');
  }
  const newReservedUnits = arrayWithoutUnit(gameState.reservedUnits, unit);
  return {
    ...gameState,
    reservedUnits: newReservedUnits,
  };
}
