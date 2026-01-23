import type { Board, GameState, UnitInstance } from '@entities';
import { updateRoundState } from './updateRoundState';

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
  state: GameState<TBoard>,
  units: Set<UnitInstance>,
): GameState<TBoard> {
  return updateRoundState(state, (current) => ({
    ...current,
    commandedUnits: new Set([...current.commandedUnits, ...units]),
  }));
}
