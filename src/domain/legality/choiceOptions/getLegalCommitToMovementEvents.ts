import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { CommitToMovementEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import type { GameState } from '@game';
import {
  getNextEventNumber,
  getOtherPlayer,
  getOwnedPlayerCardState,
} from '@queries';

/** Modifier types that may appear on a commitToMovement event. */
const MOVEMENT_MODIFIER_TYPES = [
  'speed',
  'flexibility',
] as const satisfies readonly StatModifier[];

type MovementModifier = (typeof MOVEMENT_MODIFIER_TYPES)[number];

function isMovementModifier(
  modifier: StatModifier,
): modifier is MovementModifier {
  return (MOVEMENT_MODIFIER_TYPES as readonly string[]).includes(modifier);
}

function movementModifiersOnCard(card: CommandCard): MovementModifier[] {
  return card.modifiers.filter(isMovementModifier);
}

/**
 * Player whose commit-to-movement is pending: either the moving unit (CRS
 * commitment) or the front-engagement defender (defensive commitment).
 */
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
  if (crs.commandResolutionType !== 'movement') {
    return null;
  }

  if (crs.commitment.commitmentType === 'pending') {
    return crs.movingUnit.unit.playerSide;
  }

  if (crs.engagementState === 'pending') {
    return null;
  }

  const engagement = crs.engagementState.engagementResolutionState;
  if (
    engagement.engagementType === 'front' &&
    engagement.defensiveCommitment.commitmentType === 'pending'
  ) {
    return getOtherPlayer(crs.engagementState.engagingUnit.playerSide);
  }

  return null;
}

/**
 * Returns every legal commit-to-movement event for the player whose movement
 * (or front-engagement defensive) commitment is still pending: one event per
 * in-hand card that has at least one movement-applicable modifier.
 * `modifierTypes` is exactly that card's movement-applicable modifiers.
 *
 * Returns `[]` when commit is not expected or the pending player's hand is
 * hidden / has no eligible cards.
 */
export function getLegalCommitToMovementEvents<S extends GameState>(
  gameState: S,
): CommitToMovementEvent[] {
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
  const result: CommitToMovementEvent[] = [];

  for (const committedCard of hand) {
    const modifierTypes = movementModifiersOnCard(committedCard);
    if (modifierTypes.length === 0) {
      continue;
    }
    result.push({
      choiceType: 'commitToMovement',
      committedCard,
      eventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      modifierTypes,
      player,
    });
  }

  return result;
}
