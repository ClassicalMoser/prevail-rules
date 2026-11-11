import type { ExpectedEventInfo } from '@events';
import type { GameState, MeleeResolutionState } from '@game';
import {
  attackApplyStages,
  findNextMeleeAttackApplyToClose,
  findPlayerOwingMeleeCommitment,
  getMeleeAppliesInResolutionOrder,
} from '@queries';
import {
  getExpectedAttackApplyEvent,
  findExpectedAttackApplyStageEvent,
} from '../composable';

/**
 * Gets the expected event for melee resolution substeps.
 * This is a composable function that can be used in any context where
 * melee resolution state appears.
 *
 * @param gameState - The game state, needed to read what's happening on the board
 * @param meleeState - The melee resolution state
 * @returns Information about what event is expected
 */
export function getExpectedMeleeResolutionEvent(
  gameState: GameState,
  meleeState: MeleeResolutionState,
): ExpectedEventInfo {
  // Fast rejection: if already completed, this is an invalid state
  if (meleeState.completed) {
    throw new Error('Melee resolution state is already complete');
  }

  const { firstPlayerAttackApplyState, secondPlayerAttackApplyState } =
    meleeState;

  // Each player may commit a card before the blows are counted, the first
  // player first and the second after (§7.2.2).
  const owingCommitment = findPlayerOwingMeleeCommitment(gameState, meleeState);
  if (owingCommitment !== undefined) {
    return {
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: owingCommitment,
    };
  }

  // Both commitments resolved, check if resolveMelee has been applied
  // ResolveMelee creates both attackApplyStates
  if (
    firstPlayerAttackApplyState === 'pending' ||
    secondPlayerAttackApplyState === 'pending'
  ) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveMelee',
    };
  }

  // Both units' results are carried out a stage at a time: both retreats,
  // then both reverses, then both routs. The first player's blow lands
  // first, so the second player's unit suffers first in each (§7.5.6). A unit
  // that has already fallen back no longer keeps the other engaged, so the
  // other can reverse; a unit still to rout is on the board until its stage,
  // so the one engaged with it does not.
  const appliesInOrder = getMeleeAppliesInResolutionOrder(meleeState);
  for (const stage of attackApplyStages) {
    for (const apply of appliesInOrder) {
      const due = findExpectedAttackApplyStageEvent(apply, stage);
      if (due !== undefined) {
        return due;
      }
    }
  }

  // Every stage is done, so each apply only needs closing, in the same order.
  const toClose = findNextMeleeAttackApplyToClose(meleeState);
  if (toClose !== undefined) {
    return getExpectedAttackApplyEvent(toClose);
  }

  // Both attack apply states are complete, melee resolution should be complete
  return {
    actionType: 'gameEffect',
    effectType: 'completeMeleeResolution',
  };
}
