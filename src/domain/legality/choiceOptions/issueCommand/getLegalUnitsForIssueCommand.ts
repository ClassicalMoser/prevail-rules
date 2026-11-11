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
 * {@link getLegalUnitsToOrder}).
 * For `size: 'lines'`: the units a line may be traced from, since every line
 * needs one unit within inspiration range (see {@link getLegalLines}).
 */
export function getLegalUnitsForIssueCommand(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): UnitWithPlacement[] {
  const onBoard = getPlayerUnitsWithPlacementOnBoard(gameState, player);
  const result: UnitWithPlacement[] = [];

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
    // Within inspiration range, where the order needs it.
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

  return result;
}
