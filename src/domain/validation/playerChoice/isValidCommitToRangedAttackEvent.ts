import type { ValidationResult } from '@utils';
import type { CommitToRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToRangedAttackEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToRangedAttackEvent by membership against
 * {@link getLegalCommitToRangedAttackEvents} (player, card id or refuse).
 */
export function isValidCommitToRangedAttackEvent(
  event: CommitToRangedAttackEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalCommitToRangedAttackEvents(state);
  const validation = isValidCommitment(event, legalOptions, 'ranged attack');
  return validation;
}
