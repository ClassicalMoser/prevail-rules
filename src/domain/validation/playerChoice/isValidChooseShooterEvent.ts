import type { ValidationResult } from '@utils';
import type { ChooseShooterEvent } from '@events';
import type { GameState } from '@game';
import { getLegalRangedAttackers } from '@legality';
import { isSameUnitInstance } from '@queries';

/**
 * Validates a ChooseShooterEvent by membership against
 * {@link getLegalRangedAttackers}: the player carrying out a Shoot order
 * names one of the ordered units still to act that may shoot — unengaged,
 * with Range, and something to shoot at — standing where the board has it
 * (§4.3.11 step 1).
 */
export function isValidChooseShooterEvent(
  event: ChooseShooterEvent,
  state: GameState,
): ValidationResult {
  // A shooter is named only while a Shoot order waits for its next shot.
  const legal = getLegalRangedAttackers(state);

  // Only the player carrying out the order names its shooters.
  // The expected check refuses anyone else first; this keeps the validator
  // whole when it is asked directly.
  if (event.player !== legal.player) {
    const wrongPlayer: ValidationResult = {
      errorReason: `Expected a shooter from ${legal.player}, got ${event.player}`,
      result: false,
    };
    return wrongPlayer;
  }

  // It must be one of the units offered, by who it is.
  const offered = legal.attackers.some((candidate) =>
    isSameUnitInstance(candidate.unit, event.unit),
  );
  if (!offered) {
    // A unit the order did not name, one that has already shot or supported
    // a shot (§7.3.4), or one with nothing in its arc to shoot at.
    const notOffered: ValidationResult = {
      errorReason: `Unit is not a legal ranged attacker for ${event.player}`,
      result: false,
    };
    return notOffered;
  }

  // One of the ordered units that may shoot; its commitment and target come
  // next (§4.3.11 steps 2 and 3).
  const valid: ValidationResult = { result: true };
  return valid;
}
