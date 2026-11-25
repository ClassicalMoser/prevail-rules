import type { ValidationResult } from '@utils';
import type { CommitToMovementEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToMovementEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToMovementEvent by membership against
 * {@link getLegalCommitToMovementEvents} (player, card id or refuse).
 *
 * Two moments share this choice, both offering Speed or Flexibility (§8.4):
 * the moving player before the unit sets off (§4.3.10 step 2), and the
 * defender of a front engagement before the two Speeds are compared
 * (§6.3.2).
 *
 * @param event - The commitment the player sent
 * @param state - The game, carrying out a move whose commitment is owed
 * @returns Success, or why the commitment is not one offered
 */
export function isValidCommitToMovementEvent(
  event: CommitToMovementEvent,
  state: GameState,
): ValidationResult {
  // The commitments open to whichever of the two is owed one: the mover, or
  // the defender it walked into head on. Asked when neither is owed, the
  // enumerator throws; the expected check refuses such a choice first.
  const legalOptions = getLegalCommitToMovementEvents(state);

  // The choice must be one of them; a refusal names the moment as movement.
  const validation = isValidCommitment(event, legalOptions, 'movement');
  return validation;
}
