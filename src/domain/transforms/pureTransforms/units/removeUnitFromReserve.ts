import type { Board, UnitInstance } from "@entities";
import type { GameStateForBoard } from "@game";
import { hasUnitInSet, setWithoutUnit } from "@queries";

export function removeUnitFromReserve<TBoard extends Board>(
  gameState: GameStateForBoard<TBoard>,
  unit: UnitInstance,
): GameStateForBoard<TBoard> {
  if (!hasUnitInSet(gameState.reservedUnits, unit)) {
    throw new Error("Unit not present in reserve");
  }
  const newReservedUnits = setWithoutUnit(gameState.reservedUnits, unit);
  return {
    ...gameState,
    reservedUnits: newReservedUnits,
  };
}
