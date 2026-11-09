import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type {
  CommitToRangedDefenseEvent,
  RangedDefenseModifier,
} from '@events';
import type { GameState } from '@game';
import { rangedDefenseModifierTypes } from '@events';
import { createCommitToRangedDefenseEvent } from '@factories';
import { getNextEventNumber, getOwnedPlayerCardState } from '@queries';

// TODO(composition): the hand walk below (card filter, hidden-hand refuse,
// refuse option) is the fourth copy, after the melee, movement and ranged
// attack commitments. Settled by one helper taking the accepted stats.

/** Whether a stat on a card is one a shot's target may commit it for (§8.4, B1). */
function isRangedDefenseModifier(
  modifier: StatModifier,
): modifier is RangedDefenseModifier {
  const accepted: readonly StatModifier[] = rangedDefenseModifierTypes;
  const isAccepted = accepted.includes(modifier);
  return isAccepted;
}

/**
 * The target's owner, while its commitment is owed: the shooter has
 * committed or refused and named its target, and the target has not yet
 * answered (§4.3.11 step 5).
 */
function pendingTargetOwner<S extends GameState>(
  gameState: S,
): PlayerSide | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  // Shots are fired only while a Shoot order is being carried out.
  if (
    phaseState === 'none' ||
    phaseState.phase !== 'issueCommands' ||
    phaseState.currentCommandResolutionState === 'pending'
  ) {
    return null;
  }

  const resolution = phaseState.currentCommandResolutionState;
  if (resolution.commandResolutionType !== 'rangedAttack') {
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
 * shot's target (§4.3.11, B1): one event per card in hand naming Defence or
 * Flexibility, with exactly those of its stats (§8.4), plus a refuse option
 * (`committedCard: null`).
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

  const eventNumber = getNextEventNumber(gameState);
  const result: CommitToRangedDefenseEvent[] = [];

  // A seat that cannot see this hand can still refuse; only its owner can
  // name a card from it.
  let hand: CommandCard[] | undefined;
  try {
    hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
  } catch {
    hand = undefined;
  }

  // Each card naming Defence or Flexibility is a commitment the target may
  // make; a card with neither is no use here and is not offered (§8.4).
  if (hand !== undefined) {
    for (const committedCard of hand) {
      const modifierTypes = committedCard.modifiers.filter(
        isRangedDefenseModifier,
      );
      if (modifierTypes.length === 0) {
        continue;
      }
      result.push(
        createCommitToRangedDefenseEvent({
          player,
          eventNumber,
          committedCard,
          modifierTypes,
        }),
      );
    }
  }

  // Commitment is always optional (§8.3).
  result.push(
    createCommitToRangedDefenseEvent({
      player,
      eventNumber,
      committedCard: null,
      modifierTypes: [],
    }),
  );

  return result;
}
