import type { Board, UnitInstance } from "@entities";
import type { GameStateForBoard } from "@game";
import { updateRoundState } from "../state";

/**
 * Adds units to the commandedUnits set in the current round state.
 * Handles the immutable update of commandedUnits.
 *
 * @param state - The current game state
 * @param units - The units to add to commandedUnits
 * @returns A new game state with the units added to commandedUnits
 *
 * @example
 * ```ts
 * const newState = addUnitsToCommandedUnits(state, new Set([unit1, unit2]));
 * ```
 */
export function addUnitsToCommandedUnits<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  units: Set<UnitInstance>,
): GameStateForBoard<TBoard> {
  const previousCommandedUnits = state.currentRoundState.commandedUnits;
  const newCommandedUnits = new Set([...previousCommandedUnits, ...units]);
  return updateRoundState(state, {
    ...state.currentRoundState,
    commandedUnits: newCommandedUnits,
  });
}
