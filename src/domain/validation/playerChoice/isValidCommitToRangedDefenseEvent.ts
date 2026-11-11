import type { ValidationResult } from '@utils';
import type { CommitToRangedDefenseEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToRangedDefenseEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToRangedDefenseEvent by membership against
 * {@link getLegalCommitToRangedDefenseEvents}: the target's owner commits a
 * card from hand that names Defence or Flexibility, or refuses (§4.3.11 step 5).
 */
export function isValidCommitToRangedDefenseEvent(
  event: CommitToRangedDefenseEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalCommitToRangedDefenseEvents(state);
  const validation = isValidCommitment(event, legalOptions, 'ranged defense');
  return validation;
}
