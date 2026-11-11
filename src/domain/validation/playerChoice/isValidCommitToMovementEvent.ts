import type { ValidationResult } from '@utils';
import type { CommitToMovementEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToMovementEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToMovementEvent by membership against
 * {@link getLegalCommitToMovementEvents} (player, card id or refuse).
 */
export function isValidCommitToMovementEvent(
  event: CommitToMovementEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalCommitToMovementEvents(state);
  const validation = isValidCommitment(event, legalOptions, 'movement');
  return validation;
}
