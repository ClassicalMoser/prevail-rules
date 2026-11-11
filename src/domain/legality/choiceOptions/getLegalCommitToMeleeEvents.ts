import type { PlayerSide } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { meleeModifierTypes } from '@events';
import { createCommitToMeleeEvent } from '@factories';
import { getOtherPlayer } from '@queries';
import { getCommitmentOffers } from './commitment';

/**
 * The player whose melee commitment is owed. The first player commits
 * first, then the second (§7.2.2); once both have, nobody is asked.
 *
 * @param gameState - The game state
 * @returns The player to ask, or `null` when no melee commitment is owed
 */
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

  if (meleeState.firstPlayerCommitment.commitmentType === 'pending') {
    return firstPlayer;
  }
  if (meleeState.secondPlayerCommitment.commitmentType === 'pending') {
    return secondPlayer;
  }
  return null;
}

/**
 * Returns every legal commit-to-melee event for the player whose melee
 * commitment is still pending: one event per in-hand card that has at least
 * one melee-applicable modifier, plus a refuse option (`committedCard: null`).
 * `modifierTypes` is exactly that card's melee-applicable modifiers.
 *
 * Returns `[]` when commit is not expected. When the hand is hidden, only the
 * refuse option is returned (card commits require an owned hand).
 */
export function getLegalCommitToMeleeEvents<S extends GameState>(
  gameState: S,
): CommitToMeleeEvent[] {
  const player = pendingCommitPlayer(gameState);
  if (player === null) {
    return [];
  }

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    meleeModifierTypes,
  );
  const events = offers.map((offer) =>
    createCommitToMeleeEvent({
      committedCard: offer.committedCard,
      modifierTypes: offer.modifierTypes,
      player,
    }),
  );
  return events;
}
