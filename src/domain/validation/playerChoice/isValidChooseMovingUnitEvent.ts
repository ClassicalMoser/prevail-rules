import type { ValidationResult } from '@utils';
import type { ChooseMovingUnitEvent } from '@events';
import type { GameState } from '@game';
import { getLegalMoveUnits } from '@legality';
import { isSameUnitWithPlacement } from '@queries';

/**
 * Validates a ChooseMovingUnitEvent by membership against
 * {@link getLegalMoveUnits}: the player carrying out a Move order names one
 * of the ordered units still to move, standing where the board has it
 * (§4.3.10).
 */
export function isValidChooseMovingUnitEvent(
  event: ChooseMovingUnitEvent,
  state: GameState,
): ValidationResult {
  try {
    const legal = getLegalMoveUnits(state);
    if (legal === null) {
      return {
        errorReason:
          'Choosing a unit to move is not expected in the current state',
        result: false,
      };
    }

    if (event.player !== legal.player) {
      return {
        errorReason: `Expected a unit to move from ${legal.player}, got ${event.player}`,
        result: false,
      };
    }

    // Who it is and where it stands must both match an offered unit.
    const offered = legal.units.some(
      (candidate) => isSameUnitWithPlacement(candidate, event.unit).result,
    );
    if (!offered) {
      return {
        errorReason: `Unit is not a legal move candidate for ${event.player}`,
        result: false,
      };
    }

    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
