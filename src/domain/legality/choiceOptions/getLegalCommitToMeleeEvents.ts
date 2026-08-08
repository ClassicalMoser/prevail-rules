import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import type { GameState } from '@game';
import {
  getNextEventNumber,
  getOtherPlayer,
  getOwnedPlayerCardState,
} from '@queries';

/** Modifier types that may appear on a commitToMelee event. */
const MELEE_MODIFIER_TYPES = [
  'attack',
  'defense',
  'flexibility',
] as const satisfies readonly StatModifier[];

type MeleeModifier = (typeof MELEE_MODIFIER_TYPES)[number];

function isMeleeModifier(modifier: StatModifier): modifier is MeleeModifier {
  return (MELEE_MODIFIER_TYPES as readonly string[]).includes(modifier);
}

function meleeModifiersOnCard(card: CommandCard): MeleeModifier[] {
  return card.modifiers.filter(isMeleeModifier);
}

function pendingCommitPlayer<S extends GameState>(
  gameState: S,
): PlayerSide | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (
    phaseState === 'none' ||
    phaseState.phase !== 'resolveMelee' ||
    phaseState.step !== 'resolveMelee' ||
    phaseState.currentMeleeResolutionState === 'pending'
  ) {
    return null;
  }

  const meleeState = phaseState.currentMeleeResolutionState;
  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  if (meleeState[`${firstPlayer}Commitment`].commitmentType === 'pending') {
    return firstPlayer;
  }
  if (meleeState[`${secondPlayer}Commitment`].commitmentType === 'pending') {
    return secondPlayer;
  }
  return null;
}

/**
 * Returns every legal commit-to-melee event for the player whose melee
 * commitment is still pending: one event per in-hand card that has at least
 * one melee-applicable modifier. `modifierTypes` is exactly that card's
 * melee-applicable modifiers (all applied).
 *
 * Returns `[]` when commit is not expected or the pending player's hand is
 * hidden / has no eligible cards.
 */
export function getLegalCommitToMeleeEvents<S extends GameState>(
  gameState: S,
): CommitToMeleeEvent[] {
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
  const result: CommitToMeleeEvent[] = [];

  for (const committedCard of hand) {
    const modifierTypes = meleeModifiersOnCard(committedCard);
    if (modifierTypes.length === 0) {
      continue;
    }
    result.push({
      choiceType: 'commitToMelee',
      committedCard,
      eventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      modifierTypes,
      player,
    });
  }

  return result;
}
