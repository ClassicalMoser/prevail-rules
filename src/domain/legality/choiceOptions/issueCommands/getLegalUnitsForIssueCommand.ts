import type { Command, PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  canBeOrdered,
  getPlayerUnitsWithPlacementOnBoard,
  unitMatchesInspirationRange,
} from '@queries';

/**
 * Returns friendly on-board units eligible under full command restrictions
 * (inspiration + traits/types). Excludes already-commanded units, and engaged
 * ones (§4.3.4).
 *
 * For `size: 'units'`: the units that may be chosen (see
 * `getLegalUnitsToOrder`).
 * For `size: 'lines'`: the units a line may be traced from, since every line
 * needs one unit within inspiration range (see `getLegalLines`).
 *
 * @param command - The command on the card in play
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @returns Each of the player's units the order may name, with where it stands
 */
export function getLegalUnitsForIssueCommand(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): UnitWithPlacement[] {
  // An order reaches only the player's own units on the board (§4.3.4).
  const onBoard = getPlayerUnitsWithPlacementOnBoard(gameState, player);
  const result: UnitWithPlacement[] = [];

  // The units already ordered this round; none takes a second order (§4.3.6).
  const { commandedUnits } = gameState.currentRoundState;

  for (const unitWithPlacement of onBoard) {
    // Free of an engagement, not yet commanded, and allowed by the order's
    // traits and types (§4.3.4, §4.3.6).
    if (
      !canBeOrdered(
        unitWithPlacement,
        gameState.boardState,
        command.restrictions,
        commandedUnits,
      )
    ) {
      continue;
    }
    // Within inspiration range, where the order needs it: measured from the
    // player's own commander now, as the order is issued (§4.3.4).
    if (
      unitMatchesInspirationRange(
        unitWithPlacement.unit,
        command.restrictions,
        gameState,
      )
    ) {
      result.push(unitWithPlacement);
    }
  }

  // Every unit meeting the order's full restrictions; empty when none does,
  // and the order can then be given to nobody.
  return result;
}
