import type { ExpectedEventInfo } from '@events';
import type { GameState, MeleeResolutionState } from '@game';
import {
  attackApplyStages,
  findNextMeleeAttackApplyToClose,
  findPlayerOwingMeleeCommitment,
  getMeleeAppliesInResolutionOrder,
} from '@queries';
import { isPending } from '@utils';
import {
  getExpectedAttackApplyEvent,
  findExpectedAttackApplyStageEvent,
} from '../composable';

/**
 * Gets the expected event for melee resolution substeps.
 * This is a composable function that can be used in any context where
 * melee resolution state appears.
 *
 * One engagement is fought in the order of a melee (§7.2.2): each side's
 * commitment, the blows counted at once, both units' results carried out a
 * stage at a time, and then the melee's end. The Resolve Melee phase
 * sequencer asks this while the engagement the first player chose is fought.
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
  // A fought melee is cleared from the phase by completeMeleeResolution, so
  // the phase sequencer never hands over one that is over.
  // TODO(composition): nothing in play sets `completed` on a melee (the
  // completing effect clears the slot to 'pending' instead), so this guard
  // catches only a forged state. Deciding whether the substep keeps a
  // `completed` flag at all would settle both the field and the guard.
  if (meleeState.completed) {
    throw new Error('Melee resolution state is already complete');
  }

  // Each unit's results, measured on it by the other's blow; 'pending' until
  // the melee is fought.
  const { attackOnFirstPlayerApplyState, attackOnSecondPlayerApplyState } =
    meleeState;

  // Each player may commit a card before the attack values are counted, the first
  // player first and the second after (§7.2.2).
  const owingCommitment = findPlayerOwingMeleeCommitment(gameState, meleeState);
  if (owingCommitment !== undefined) {
    // That player may commit a card or decline; either way the game waits on it.
    const commitToMelee: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: owingCommitment,
    };
    return commitToMelee;
  }

  // Both commitments resolved, check if resolveMelee has been applied
  // ResolveMelee creates both attackApplyStates
  // Melee is simultaneous (§7.2.1): both attack values are counted from the
  // board as it stands, before either unit is touched, so both results are
  // written by the one effect. A melee never has one written and the other
  // waiting; checking either would do, and both are checked so that a
  // half-written melee is not taken for a fought one.
  // TODO(composition): "both melee applies are written" is spelled out here,
  // in getAttackApplyToClose and in findNextMeleeAttackApplyToClose (as fewer
  // than two applies in resolution order). One query in @queries
  // sequencing/meleeResolution, asked by all three, would settle it.
  if (
    isPending(attackOnFirstPlayerApplyState) ||
    isPending(attackOnSecondPlayerApplyState)
  ) {
    const resolveMelee: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'resolveMelee',
    };
    return resolveMelee;
  }

  // Both units' results are carried out a stage at a time: both retreats,
  // then both reverses, then both routs. The first player's attack takes
  // effect first, so the second player's unit suffers first in each (§7.5.6). A unit
  // that has already fallen back no longer keeps the other engaged, so the
  // other can reverse; a unit still to rout is on the board until its stage,
  // so the one engaged with it does not.
  const appliesInOrder = getMeleeAppliesInResolutionOrder(meleeState);
  for (const stage of attackApplyStages) {
    for (const apply of appliesInOrder) {
      // The first unit in this stage whose result is still to be carried out,
      // such as a retreat not yet opened, is what the game waits on.
      const due = findExpectedAttackApplyStageEvent(apply, stage);
      if (due !== undefined) {
        return due;
      }
    }
  }

  // Every stage is done, so each apply only needs closing, in the same order.
  const toClose = findNextMeleeAttackApplyToClose(meleeState);
  if (toClose !== undefined) {
    const closeApply = getExpectedAttackApplyEvent(toClose);
    return closeApply;
  }

  // Both attack apply states are complete, melee resolution should be complete
  // This fight is over for the phase: the engagement has ended, or the two
  // units stay locked and fight again next round (§7.2.3). The first player
  // then chooses the next engagement, if any remain (§4.4.2).
  const completeMelee: ExpectedEventInfo = {
    actionType: 'gameEffect',
    effectType: 'completeMeleeResolution',
  };
  return completeMelee;
}
