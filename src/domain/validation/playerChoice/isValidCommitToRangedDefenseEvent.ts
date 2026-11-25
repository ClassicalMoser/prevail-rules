import type { ValidationResult } from '@utils';
import type { CommitToRangedDefenseEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToRangedDefenseEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToRangedDefenseEvent by membership against
 * {@link getLegalCommitToRangedDefenseEvents}: the target's owner commits a
 * card from hand that names Defence or Flexibility, or refuses (§4.3.11 step 5).
 *
 * @param event - The commitment the player sent
 * @param state - The game, carrying out a shot whose target has not yet
 * answered
 * @returns Success, or why the commitment is not one offered
 */
export function isValidCommitToRangedDefenseEvent(
  event: CommitToRangedDefenseEvent,
  state: GameState,
): ValidationResult {
  // The commitments open to the target's owner, who answers knowing the shot
  // it faces (§7.4.5). Asked before the target is named, or once it has
  // answered, the enumerator throws; the expected check refuses such a
  // choice first.
  const legalOptions = getLegalCommitToRangedDefenseEvents(state);

  // The choice must be one of them; a refusal names the moment as a ranged
  // defense.
  const validation = isValidCommitment(event, legalOptions, 'ranged defense');
  return validation;
}
