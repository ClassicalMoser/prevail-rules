import type { ValidationResult } from '@utils';
import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToMeleeEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToMeleeEvent by membership against
 * {@link getLegalCommitToMeleeEvents} (player, card id or refuse).
 *
 * Before the blows are counted, the first player and then the second may each
 * commit a card naming Attack, Defence or Flexibility for their own unit, or
 * decline (§7.2.2, §8.4).
 *
 * @param event - The commitment the player sent
 * @param state - The game, fighting a melee whose commitment is owed
 * @returns Success, or why the commitment is not one offered
 */
export function isValidCommitToMeleeEvent(
  event: CommitToMeleeEvent,
  state: GameState,
): ValidationResult {
  // The commitments open to the player whose turn it is to commit in this
  // melee. Asked when no melee commitment is owed, the enumerator throws;
  // the expected check refuses such a choice before this is reached.
  const legalOptions = getLegalCommitToMeleeEvents(state);

  // The choice must be one of them; a refusal names the moment as a melee.
  const validation = isValidCommitment(event, legalOptions, 'melee');
  return validation;
}
