import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { EngagementState } from '@game';
import { getFrontEngagementStage, getOtherPlayer } from '@queries';
import { throwIfBypassed, throwIfPending } from '@utils';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for engagement resolution substeps.
 * This is a composable function that can be used in any context where
 * engagement state appears (movement resolution, etc.).
 *
 * @param engagementState - The engagement state, relevant to this engagement resolution
 * Prevents having to scan through phases to find the engagement state
 * @param attackingPlayer - The player whose unit moved into the enemy
 * @returns Information about what event is expected
 */
export function getExpectedEngagementEvent(
  engagementState: EngagementState,
  attackingPlayer: PlayerSide,
): ExpectedEventInfo {
  // The defender is the unit that was already in the space (§6.1.3), so it
  // belongs to the other side; its owner makes the front engagement's choices.
  const defendingPlayer = getOtherPlayer(attackingPlayer);

  // What kind of engagement this is was fixed when it started, from the two
  // units' facings (§6.3.1), and decides everything that follows.
  const resolutionState = engagementState.engagementResolutionState;
  const { engagementType } = resolutionState;
  // Check if engagement is completed (all work done, ready for parent to handle)
  // `getExpectedMovementResolutionEvent` finishes the move once the engagement
  // is complete, and asks here only before then.
  if (engagementState.completed) {
    throw new Error('Engagement state is already complete');
  }

  // A flank engagement drags the defender round to face the engaging unit,
  // and it may not retreat (§6.3.4). The two fight in Phase 4.
  if (engagementType === 'flank') {
    // If the engagement is from the flank, we need to rotate the defending unit
    if (!resolutionState.defenderRotated) {
      // If the defending unit has not been rotated yet, we need to rotate it
      const wheelDefender: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'resolveFlankEngagement',
      };
      return wheelDefender;
    }
    // Defender rotated, flank engagement resolution should be complete
    // (but engagementState.completed should be set by the transform)
    throw new Error(
      'Flank engagement resolution complete but not marked as completed',
    );
  }

  // A rear engagement routs the defender on the spot, with no melee and no
  // reply; its owner pays its Morale at once, in Phase 3 (§6.3.3).
  if (engagementType === 'rear') {
    // If the engagement is from the rear, we need to rout the defending unit
    // Check if rout is completed
    if (!resolutionState.routState.completed) {
      const payForRout = getExpectedRoutEvent(resolutionState.routState);
      return payForRout;
    }
    // Paying for the rout closes the rear engagement and the engagement
    // together (`settleRout`), so either throw below is a fault in that write.
    // Rout is complete, check if rear engagement resolution is complete
    if (resolutionState.completed) {
      throw new Error('Rear engagement resolution state is already complete');
    }
    // Rear engagement resolution should be complete
    throw new Error('Rear engagement resolution complete but not advanced');
  }

  // A front engagement may let the defender fall back, if it is the faster
  // and has somewhere to go (§6.3.2); otherwise the two fight in Phase 4.
  if (engagementType === 'front') {
    const stage = getFrontEngagementStage(resolutionState);
    switch (stage) {
      case 'defenderCommitting': {
        // The defender may commit a card for the fight first (§6.3.2).
        // TODO(misleading): the card is not for the fight. §6.3.2 step 1 and
        // §8.4 have the defender commit for Speed or Flexibility, which counts
        // toward falling back; a card for the melee comes in Phase 4 (§7.2.2).
        // Settle by saying "for Speed or Flexibility, toward falling back".
        const defenderCommits: ExpectedEventInfo = {
          actionType: 'playerChoice',
          choiceType: 'commitToMovement',
          playerSource: defendingPlayer,
        };
        return defenderCommits;
      }
      case 'retreatBeingWorkedOut': {
        // The defender may fall back only if its Speed is strictly greater
        // than the engaging unit's, and only where it has a retreat to make
        // (§6.3.2 step 2). Comparing the two and finding its retreats is the
        // engine's work.
        const workOutRetreats: ExpectedEventInfo = {
          actionType: 'gameEffect',
          effectType: 'resolveEngageRetreatOption',
        };
        return workOutRetreats;
      }
      case 'noRetreat': {
        // A defender with nowhere to fall back to is not offered the choice
        // (§6.3.2). The effect that found no retreats closes the engagement in
        // the same write (`applyResolveEngageRetreatOptionEvent`), so an open
        // engagement here is a fault in that write.
        // TODO(misleading): the message reads as a rule ("cannot retreat"),
        // not the fault it is: the engagement should already be complete.
        // Settle by a message saying the engagement with no retreat was not
        // closed, as the `'defenderStands'` and `'retreated'` cases do.
        throw new Error('Defending unit cannot retreat');
      }
      case 'defenderDeciding': {
        // A defender that may fall back chooses whether to (§6.3.2 step 3).
        const defenderDecides: ExpectedEventInfo = {
          actionType: 'playerChoice',
          choiceType: 'chooseWhetherToRetreat',
          playerSource: defendingPlayer,
        };
        return defenderDecides;
      }
      case 'defenderStands': {
        // The transform that recorded the choice should have closed the
        // engagement.
        throw new Error(
          'Front engagement resolution complete but not marked as completed',
        );
      }
      case 'retreatOpening': {
        // An accepted retreat opens first, with the retreats worked out by
        // its procedure, then drives chooseRetreatOption / resolveRetreat.
        const openRetreat: ExpectedEventInfo = {
          actionType: 'gameEffect',
          effectType: 'openRetreatFromEngagement',
        };
        return openRetreat;
      }
      case 'retreating': {
        // The defender falls back as any retreating unit does (§9.1). The
        // engagement ends once it has, and no melee is fought (§6.3.2 step 3).
        // TODO(composition): both guards below are unreachable.
        // `getFrontEngagementStage` answers `'retreating'` only for an open
        // retreat: it answers `'retreatOpening'` for `'pending'` and throws on
        // `'bypassed'`. They are here only to narrow the type, because the
        // stage does not carry the retreat it read. Settle by having the stage
        // query hand back the open retreat with `'retreating'`, or by reading
        // it through a query that insists, and drop both guards.
        const retreatState = throwIfBypassed(
          throwIfPending(
            resolutionState.retreatState,
            'The retreat is not open',
          ),
          'The defender stood and has no retreat',
        );
        const retreatDue = getExpectedRetreatEvent(retreatState);
        return retreatDue;
      }
      case 'retreated': {
        // applyResolveRetreat should have marked the engagement complete.
        throw new Error(
          'Front engagement retreat completed but engagement not marked as completed',
        );
      }
      default: {
        // Unreachable: the stage is `getFrontEngagementStage`'s own answer,
        // never an argument, so no spec can pass a value outside the union.
        // The `never` makes a new stage fail the typecheck here.
        const _exhaustive: never = stage;
        throw new Error(`Invalid front engagement stage: ${_exhaustive}`);
      }
    }
  }

  // Every kind of engagement is handled above (§6.3.1); a value outside the
  // three is a forged state, refused by name.
  throw new Error('Invalid engagement type');
}
