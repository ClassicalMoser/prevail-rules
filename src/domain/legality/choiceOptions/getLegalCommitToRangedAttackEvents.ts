import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { CommitToRangedAttackEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import type { GameState } from '@game';
import { getNextEventNumber, getOwnedPlayerCardState } from '@queries';

/** Modifier types that may appear on a commitToRangedAttack event. */
const RANGED_MODIFIER_TYPES = [
  'range',
  'attack',
  'flexibility',
] as const satisfies readonly StatModifier[];

type RangedModifier = (typeof RANGED_MODIFIER_TYPES)[number];

function isRangedModifier(modifier: StatModifier): modifier is RangedModifier {
  return (RANGED_MODIFIER_TYPES as readonly string[]).includes(modifier);
}

function rangedModifiersOnCard(card: CommandCard): RangedModifier[] {
  return card.modifiers.filter(isRangedModifier);
}

function pendingCommitPlayer<S extends GameState>(
  gameState: S,
): PlayerSide | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (
    phaseState === 'none' ||
    phaseState.phase !== 'issueCommands' ||
    phaseState.currentCommandResolutionState === 'pending'
  ) {
    return null;
  }

  const crs = phaseState.currentCommandResolutionState;
  if (crs.commandResolutionType !== 'rangedAttack') {
    return null;
  }

  if (crs.attackingCommitment.commitmentType === 'pending') {
    return crs.attackingUnit.playerSide;
  }
  if (crs.defendingCommitment.commitmentType === 'pending') {
    return crs.defendingUnit.playerSide;
  }
  return null;
}

/**
 * Returns every legal commit-to-ranged-attack event for the player whose
 * ranged commitment is still pending (attacker first, then defender): one
 * event per in-hand card that has at least one ranged-applicable modifier.
 * `modifierTypes` is exactly that card's ranged-applicable modifiers.
 *
 * Returns `[]` when commit is not expected or the pending player's hand is
 * hidden / has no eligible cards.
 */
export function getLegalCommitToRangedAttackEvents<S extends GameState>(
  gameState: S,
): CommitToRangedAttackEvent[] {
  const player = pendingCommitPlayer(gameState);
  if (player === null) {
    return [];
  }

  let hand: CommandCard[];
  try {
    hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
  } catch {
    return [];
  }

  const eventNumber = getNextEventNumber(gameState);
  const result: CommitToRangedAttackEvent[] = [];

  for (const committedCard of hand) {
    const modifierTypes = rangedModifiersOnCard(committedCard);
    if (modifierTypes.length === 0) {
      continue;
    }
    result.push({
      choiceType: 'commitToRangedAttack',
      committedCard,
      eventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      modifierTypes,
      player,
    });
  }

  return result;
}
