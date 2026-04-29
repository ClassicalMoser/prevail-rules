import type { Board } from "@entities";
import type { CommitToRangedAttackEvent } from "@events";
import type { GameStateWithBoard, RangedAttackResolutionState } from "@game";
import { getRangedAttackResolutionState } from "@queries";
import {
  discardCardsFromHand,
  updateCardState,
  updateCommandResolutionState,
} from "@transforms/pureTransforms";

/**
 * Applies a CommitToRangedAttackEvent to the game state.
 * Updates the appropriate commitment (attacking or defending) in the ranged attack resolution state
 * and discards the card.
 * Event is assumed pre-validated (issueCommands phase, ranged attack, player is attacker or defender).
 *
 * @param event - The commit to ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the commitment updated
 */
export function applyCommitToRangedAttackEvent<TBoard extends Board>(
  event: CommitToRangedAttackEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const rangedAttackState = getRangedAttackResolutionState(state);
  const player = event.player;
  const attackingPlayer = rangedAttackState.attackingUnit.playerSide;
  const isAttackingPlayer = player === attackingPlayer;

  // Discard committed card from player's hand
  const newCardState = discardCardsFromHand(state.cardState, player, [event.committedCard.id]);

  // Mark attacking or defending commitment as completed with the chosen card
  const newCommitment = {
    commitmentType: "completed" as const,
    card: event.committedCard,
  };
  const newRangedAttackState: RangedAttackResolutionState = {
    ...rangedAttackState,
    ...(isAttackingPlayer
      ? { attackingCommitment: newCommitment }
      : { defendingCommitment: newCommitment }),
  };

  const stateWithCards = updateCardState(state, newCardState);
  const newGameState = updateCommandResolutionState(stateWithCards, newRangedAttackState);
  return newGameState;
}
