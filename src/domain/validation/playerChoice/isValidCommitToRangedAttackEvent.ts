import type { ValidationResult } from '@utils';
import type { CommitToRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToRangedAttackEvents } from '@legality';
import { isValidCommitment } from './isValidCommitment';

/**
 * Validates a CommitToRangedAttackEvent by membership against
 * {@link getLegalCommitToRangedAttackEvents} (player, card id or refuse).
 *
 * The shooter's owner commits once, before naming the target, a card naming
 * Attack, Range or Flexibility that counts for the whole shot, or declines
 * (§4.3.11 step 2, §7.4.5).
 *
 * @param event - The commitment the player sent
 * @param state - The game, carrying out a shot whose shooter has not yet
 * committed
 * @returns Success, or why the commitment is not one offered
 */
export function isValidCommitToRangedAttackEvent(
  event: CommitToRangedAttackEvent,
  state: GameState,
): ValidationResult {
  // The commitments open to the shooter's owner. Asked when no shot is
  // being taken, or once the shooter has answered, the enumerator throws;
  // the expected check refuses such a choice first.
  const legalOptions = getLegalCommitToRangedAttackEvents(state);

  // The choice must be one of them; a refusal names the moment as a ranged
  // attack.
  const validation = isValidCommitment(event, legalOptions, 'ranged attack');
  return validation;
}
