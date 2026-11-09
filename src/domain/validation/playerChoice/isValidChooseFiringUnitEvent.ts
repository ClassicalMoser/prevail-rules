import type { ValidationResult } from '@utils';
import type { ChooseFiringUnitEvent } from '@events';
import type { GameState } from '@game';
import { getLegalRangedAttackers } from '@legality';
import { isSameUnitWithPlacement } from '@queries';

/**
 * Validates a ChooseFiringUnitEvent by membership against
 * {@link getLegalRangedAttackers}: the player carrying out a Shoot order
 * names one of the ordered units still to act that may fire — unengaged,
 * with Range, and something to shoot at — standing where the board has it
 * (§4.3.11 step 1).
 */
export function isValidChooseFiringUnitEvent(
  event: ChooseFiringUnitEvent,
  state: GameState,
): ValidationResult {
  try {
    // A shooter is named only while a Shoot order waits for its next shot.
    const legal = getLegalRangedAttackers(state);
    if (legal === null) {
      const notExpected: ValidationResult = {
        errorReason:
          'Choosing a unit to fire is not expected in the current state',
        result: false,
      };
      return notExpected;
    }

    // Only the player carrying out the order names its shooters.
    if (event.player !== legal.player) {
      const wrongPlayer: ValidationResult = {
        errorReason: `Expected a unit to fire from ${legal.player}, got ${event.player}`,
        result: false,
      };
      return wrongPlayer;
    }

    // Who it is and where it stands must both match an offered unit.
    const offered = legal.attackers.some(
      (candidate) => isSameUnitWithPlacement(candidate, event.unit).result,
    );
    if (!offered) {
      const notOffered: ValidationResult = {
        errorReason: `Unit is not a legal ranged attacker for ${event.player}`,
        result: false,
      };
      return notOffered;
    }

    const valid: ValidationResult = { result: true };
    return valid;
  } catch (error) {
    const fault: ValidationResult = {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
    return fault;
  }
}
