import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState, RangedAttackResolutionState } from '@game';
import { isPending } from '@utils';
import { getOtherPlayer } from '@queries';
import { getExpectedAttackApplyEvent } from '../composable';

/**
 * Gets the expected event for ranged attack resolution substeps.
 *
 * One shot of a Shoot order is carried out in the order of §4.3.11: the
 * shooter's commitment, its target and supporters, the target's commitment,
 * the shot, and its results. The command resolution sequencer asks this
 * while a Shoot order's shooter is under way.
 *
 * @param gameState - The game state
 * @param resolutionState - The ranged attack resolution state
 * @param attackingPlayer - The player performing the attack
 * @returns Information about what event is expected
 */
export function getExpectedRangedAttackResolutionEvent(
  gameState: GameState,
  resolutionState: RangedAttackResolutionState,
  attackingPlayer: PlayerSide,
): ExpectedEventInfo {
  // TODO(composition): `gameState` is not read; the shot's order is wholly in
  // its resolution state. It is passed for a signature like its movement
  // sibling's. Dropping it here and in getExpectedCommandResolutionEvent would
  // settle it, unless a shot's sequence is expected to read the board.

  // Fast rejection: if already completed, this is an invalid state
  // TODO(composition): nothing in play sets `completed` on a shot (the
  // completing effect clears the order's slot to 'pending' instead), so this
  // guard catches only a forged state. Deciding whether the substep keeps a
  // `completed` flag at all would settle both the field and the guard.
  if (resolutionState.completed) {
    throw new Error('Ranged attack resolution state is already complete');
  }

  // A shot is one way (§7.4.4): the target's owner is the other player, and
  // has only the defending commitment to make.
  const defendingPlayer = getOtherPlayer(attackingPlayer);

  // The shooter commits first, before it aims: a Range card reaches one
  // space further, so it must already be committed when the target is
  // chosen (§4.3.11 step 2, §7.4.5).
  if (resolutionState.attackingCommitment.commitmentType === 'pending') {
    const commitToRangedAttack: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      playerSource: attackingPlayer,
    };
    return commitToRangedAttack;
  }

  // With the card committed or refused, the shooter names its target and any
  // supporters (§4.3.11 steps 3–4).
  if (isPending(resolutionState.defendingUnit)) {
    const performRangedAttack: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'performRangedAttack',
      playerSource: attackingPlayer,
    };
    return performRangedAttack;
  }

  // Then the target's owner, knowing what it faces, may commit for Defence
  // or Flexibility (§4.3.11 step 5).
  if (resolutionState.defendingCommitment.commitmentType === 'pending') {
    const commitToRangedDefense: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'commitToRangedDefense',
      playerSource: defendingPlayer,
    };
    return commitToRangedDefense;
  }

  // Both commitments resolved, check if resolveRangedAttack has been applied
  // ResolveRangedAttack calculates the attack and creates attackApplyState
  // The attack value is set against the target's thresholds (§4.3.11 step 6,
  // §7.4.3), and what it reached is recorded for carrying out.
  if (isPending(resolutionState.attackApplyState)) {
    const resolveRangedAttack: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    };
    return resolveRangedAttack;
  }

  if (!resolutionState.attackApplyState.completed) {
    // ResolveRangedAttack has been applied (attackApplyState exists)
    // Use composable function to determine next expected event
    // The target's results are carried out in order: retreat, then reverse,
    // then rout (§7.5.2), and the apply is closed once they are done.
    const applyEvent = getExpectedAttackApplyEvent(
      resolutionState.attackApplyState,
    );
    return applyEvent;
  }

  // The shot's result is settled: this shot is done, and the next shooter is
  // chosen from those still to act (§4.3.11).
  const completeRangedAttack: ExpectedEventInfo = {
    actionType: 'gameEffect',
    effectType: 'completeRangedAttack',
  };
  return completeRangedAttack;
}
