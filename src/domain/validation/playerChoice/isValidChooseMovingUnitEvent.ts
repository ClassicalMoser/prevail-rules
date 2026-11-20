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
  const legal = getLegalMoveUnits(state);

  if (event.player !== legal.player) {
    return {
      errorReason: `Expected a unit to move from ${legal.player}, got ${event.player}`,
      result: false,
    };
  }

  // It must be one of the units offered, by who it is.
  const offered = legal.units.some((candidate) =>
    isSameUnitInstance(candidate.unit, event.unit),
  );
  if (!offered) {
    return {
      errorReason: `Unit is not a legal move candidate for ${event.player}`,
      result: false,
    };
  }

  return { result: true };
}
