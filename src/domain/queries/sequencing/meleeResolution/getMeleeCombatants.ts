import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { findPlayerUnitWithPosition } from '@queries/unitPresence';
import { getMeleeResolutionState } from './getMeleeResolutionState';

/** The two units fighting a melee, by colour. */
export interface MeleeCombatants {
  /** White's unit, where it stands. */
  white: UnitWithPlacement;
  /** Black's unit, where it stands. */
  black: UnitWithPlacement;
}

/**
 * The two units fighting the melee being resolved: the white and the black unit
 * engaged in its space (§7.1). Read from the board, which holds them, so the
 * procedure that measures the attacks and the transform that records them read
 * the same two units.
 *
 * @param state - The game state, resolving a melee
 * @returns Each side's unit and where it stands
 * @throws Error when either unit is not in the melee's space
 */
export function getMeleeCombatants(state: GameState): MeleeCombatants {
  // The space the first player chose to fight in.
  const { location } = getMeleeResolutionState(state);

  // Each side's unit in that space, read from the board.
  const white = findPlayerUnitWithPosition(state.boardState, location, 'white');
  const black = findPlayerUnitWithPosition(state.boardState, location, 'black');

  // A melee is fought between two units in one space; without both there is
  // no melee, and the state is at fault.
  if (white === undefined || black === undefined) {
    throw new Error('Units not found on board');
  }

  // Both units, by colour.
  const combatants: MeleeCombatants = { black, white };
  return combatants;
}
