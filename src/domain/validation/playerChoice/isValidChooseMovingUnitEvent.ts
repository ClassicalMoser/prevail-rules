import type { ValidationResult } from '@utils';
import type { ChooseMovingUnitEvent } from '@events';
import type { GameState } from '@game';
import { getLegalMoveUnits } from '@legality';
import { isSameUnitInstance } from '@queries';

/**
 * Validates a ChooseMovingUnitEvent by membership against
 * {@link getLegalMoveUnits}: the player carrying out a Move order names one
 * of the ordered units still to move (§4.3.10). The event names the unit by
 * who it is; where it stands is the board's to say.
 */
export function isValidChooseMovingUnitEvent(
  event: ChooseMovingUnitEvent,
  state: GameState,
): ValidationResult {
  // The units the Move order named that have yet to move and are free to:
  // still on the board, and not locked in a fight (§6.1.2).
  const legal = getLegalMoveUnits(state);

  // Only the player carrying out the order names the next unit to move
  // (§4.3.9). The expected check refuses anyone else first; this keeps the
  // validator whole when it is asked directly.
  if (event.player !== legal.player) {
    const wrongPlayer: ValidationResult = {
      errorReason: `Expected a unit to move from ${legal.player}, got ${event.player}`,
      result: false,
    };
    return wrongPlayer;
  }

  // It must be one of the units offered, by who it is.
  const offered = legal.units.some((candidate) =>
    isSameUnitInstance(candidate.unit, event.unit),
  );
  if (!offered) {
    // A unit the order did not name, one that has already moved, or one
    // that cannot move now: each unit is ordered once a round (§4.3.6).
    const notOffered: ValidationResult = {
      errorReason: `Unit is not a legal move candidate for ${event.player}`,
      result: false,
    };
    return notOffered;
  }

  // One of the ordered units still to move; its path is the next choice.
  const valid: ValidationResult = { result: true };
  return valid;
}
