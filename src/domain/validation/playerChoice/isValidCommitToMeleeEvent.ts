import type { ValidationResult } from '@utils';
import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToMeleeEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToMeleeEvent by membership against
 * {@link getLegalCommitToMeleeEvents} (player, card id or refuse).
 */
export function isValidCommitToMeleeEvent(
  event: CommitToMeleeEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalCommitToMeleeEvents(state);
  const validation = isValidCommitment(event, legalOptions, 'melee');
  return validation;
}
