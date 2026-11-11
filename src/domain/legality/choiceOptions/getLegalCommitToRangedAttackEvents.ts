import type { PlayerSide } from '@entities';
import type { CommitToRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { rangedAttackModifierTypes } from '@events';
import { createCommitToRangedAttackEvent } from '@factories';
import { findRangedAttackResolutionState } from '@queries';
import { getCommitmentOffers } from './commitment';

/**
 * The shooting player, while the shooter's commitment is owed: a ranged
 * attack is open and its attacker has not yet committed or refused. Once it
 * has, the next commitment in the shot is the target's, which is a different
 * choice (`commitToRangedDefense`).
 */
function pendingShooter<S extends GameState>(gameState: S): PlayerSide | null {
  // Shots are taken only while a Shoot order is being carried out.
  const resolution = findRangedAttackResolutionState(gameState);
  if (resolution === undefined) {
    return null;
  }

  // The shooter commits once, after it is named and before its target is
  // (§4.3.11 step 2, §7.4.5).
  if (resolution.attackingCommitment.commitmentType !== 'pending') {
    return null;
  }
  const shooter = resolution.attackingUnit.playerSide;
  return shooter;
}

/**
 * Returns every legal commit-to-ranged-attack event for the shooter whose
 * commitment is still owed (§4.3.11 step 2): one event per card in hand
 * naming Range, Attack or Flexibility, plus a refuse option
 * (`committedCard: null`). The card counts for the whole shot — its Range
 * when the target is chosen, its Attack when the shot lands.
 *
 * Returns `[]` when the shooter's commitment is not expected. When the hand
 * is hidden, only the refuse option is returned (card commits require an
 * owned hand).
 */
export function getLegalCommitToRangedAttackEvents<S extends GameState>(
  gameState: S,
): CommitToRangedAttackEvent[] {
  const player = pendingShooter(gameState);
  if (player === null) {
    const none: CommitToRangedAttackEvent[] = [];
    return none;
  }

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    rangedAttackModifierTypes,
  );
  const events = offers.map((offer) =>
    createCommitToRangedAttackEvent({
      committedCard: offer.committedCard,
      player,
    }),
  );
  return events;
}
