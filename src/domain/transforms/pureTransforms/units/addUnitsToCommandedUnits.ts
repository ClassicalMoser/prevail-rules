import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { updateRoundState } from '../state';

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
 *
 * A unit is commanded once per round (§4.3.6), and its command's modifiers
 * hold for it all round (§4.3.8); this list is what both are read from
 * (`canBeOrdered`, `getRawUnitStat`). `applyIssueCommandsEvent` writes it as a
 * player issues their orders, with the board's own copy of each unit.
 */
// TODO(misleading): the header calls `commandedUnits` a set, and the code
// passes it through a `Set`, which drops a repeat only when it is the very same
// object. The round state holds a list, and every reader matches units by who
// they are (`hasUnitInArray`). Legality already refuses a second order for a
// unit (§4.3.6), so the `Set` never has a repeat to drop. Settled by dropping
// the `Set` and the word, or by deciding a repeat is a fault and throwing.
export function addUnitsToCommandedUnits<S extends GameState>(
  state: S,
  units: UnitInstance[],
): S {
  // The units already commanded this round, then the ones ordered now.
  const previousCommandedUnits = state.currentRoundState.commandedUnits;
  const newCommandedUnits = new Set([...previousCommandedUnits, ...units]);

  // The round's list grows; nothing else in the round changes.
  const roundState = {
    ...state.currentRoundState,
    commandedUnits: [...newCommandedUnits],
  };
  const withCommanded = updateRoundState(state, roundState);

  // The game with these units commanded for the rest of the round.
  return withCommanded;
}
