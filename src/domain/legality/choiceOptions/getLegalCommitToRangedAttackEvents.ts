import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { CommitToRangedAttackEvent, RangedAttackModifier } from '@events';
import type { GameState } from '@game';
import { rangedAttackModifierTypes } from '@events';
import { createCommitToRangedAttackEvent } from '@factories';
import { getNextEventNumber, getOwnedPlayerCardState } from '@queries';

/** Whether a stat on a card is one a shooter may commit it for (§8.4). */
function isRangedAttackModifier(
  modifier: StatModifier,
): modifier is RangedAttackModifier {
  const accepted: readonly StatModifier[] = rangedAttackModifierTypes;
  const isAccepted = accepted.includes(modifier);
  return isAccepted;
}

/**
 * The stats on a card that count for the shooter; a card whose stats are
 * all of other kinds is no use to it and is not offered (§8.4).
 */
function rangedAttackModifiersOnCard(
  card: CommandCard,
): RangedAttackModifier[] {
  const modifiers = card.modifiers.filter(isRangedAttackModifier);
  return modifiers;
}

/**
 * The shooting player, while the shooter's commitment is owed: a ranged
 * attack is open and its attacker has not yet committed or refused. Once it
 * has, the next commitment in the shot is the target's, which is a different
 * choice (`commitToRangedDefense`).
 */
function pendingShooter<S extends GameState>(gameState: S): PlayerSide | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  // Shots are taken only while a Shoot order is being carried out.
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
 * (`committedCard: null`). `modifierTypes` is exactly that card's stats of
 * those kinds. The card counts for the whole shot — its Range when the
 * target is chosen, its Attack when the shot lands.
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

  const eventNumber = getNextEventNumber(gameState);
  const result: CommitToRangedAttackEvent[] = [];

  // A seat that cannot see this hand can still refuse; only its owner can
  // name a card from it.
  let hand: CommandCard[] | undefined;
  try {
    hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
  } catch {
    hand = undefined;
  }

  // Each card in hand naming a stat the shooter can use is a commitment it
  // may make (§8.4).
  if (hand !== undefined) {
    for (const committedCard of hand) {
      const modifierTypes = rangedAttackModifiersOnCard(committedCard);
      if (modifierTypes.length === 0) {
        continue;
      }
      result.push(
        createCommitToRangedAttackEvent({
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
    createCommitToRangedAttackEvent({
      player,
      eventNumber,
      committedCard: null,
      modifierTypes: [],
    }),
  );

  return result;
}
