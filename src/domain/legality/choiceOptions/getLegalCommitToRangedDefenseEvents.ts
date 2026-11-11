import type { PlayerSide } from '@entities';
import type { CommitToRangedDefenseEvent } from '@events';
import type { GameState } from '@game';
import { rangedDefenseModifierTypes } from '@events';
import { createCommitToRangedDefenseEvent } from '@factories';
import { findRangedAttackResolutionState } from '@queries';
import { getCommitmentOffers } from './commitment';

/**
 * The target's owner, while its commitment is owed: the shooter has
 * committed or refused and named its target, and the target has not yet
 * answered (§4.3.11 step 5).
 */
function pendingTargetOwner<S extends GameState>(
  gameState: S,
): PlayerSide | null {
  // Shots are taken only while a Shoot order is being carried out.
  const resolution = findRangedAttackResolutionState(gameState);
  if (resolution === undefined) {
    return null;
  }

  // Until the target is named there is no one to defend: the defender
  // commits after the shooter, knowing what it faces (§7.4.5).
  if (resolution.defendingUnit === 'pending') {
    return null;
  }

  // The target commits once.
  if (resolution.defendingCommitment.commitmentType !== 'pending') {
    return null;
  }
  const owner = resolution.defendingUnit.playerSide;
  return owner;
}

/**
 * Returns every legal commit-to-ranged-defense event for the owner of a
 * shot's target (§4.3.11): one event per card in hand naming Defence or
 * Flexibility (§8.4), plus a refuse option (`committedCard: null`).
 *
 * Returns `[]` when the target's commitment is not expected. When the hand
 * is hidden, only the refuse option is returned (card commits require an
 * owned hand).
 */
export function getLegalCommitToRangedDefenseEvents<S extends GameState>(
  gameState: S,
): CommitToRangedDefenseEvent[] {
  const player = pendingTargetOwner(gameState);
  if (player === null) {
    const none: CommitToRangedDefenseEvent[] = [];
    return none;
  }

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    rangedDefenseModifierTypes,
  );
  const events = offers.map((offer) =>
    createCommitToRangedDefenseEvent({
      committedCard: offer.committedCard,
      player,
    }),
  );
  return events;
}
