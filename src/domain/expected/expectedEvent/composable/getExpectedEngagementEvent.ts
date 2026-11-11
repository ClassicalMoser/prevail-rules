import type { ExpectedEventInfo } from '@events';
import type { EngagementState } from '@game';
import { getFrontEngagementStage, getOtherPlayer } from '@queries';
import { throwIfPending } from '@utils';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for engagement resolution substeps.
 * This is a composable function that can be used in any context where
 * engagement state appears (movement resolution, etc.).
 *
 * @param engagementState - The engagement state, relevant to this engagement resolution
 * Prevents having to scan through phases to find the engagement state
 * @returns Information about what event is expected
 */
export function getExpectedEngagementEvent(
  engagementState: EngagementState,
): ExpectedEventInfo {
  const attackingPlayer = engagementState.engagingUnit.playerSide;
  const defendingPlayer = getOtherPlayer(attackingPlayer);

  const resolutionState = engagementState.engagementResolutionState;
  const { engagementType } = resolutionState;
  // Check if engagement is completed (all work done, ready for parent to handle)
  if (engagementState.completed) {
    throw new Error('Engagement state is already complete');
  }

  if (engagementType === 'flank') {
    // If the engagement is from the flank, we need to rotate the defending unit
    if (!resolutionState.defenderRotated) {
      // If the defending unit has not been rotated yet, we need to rotate it
      return {
        actionType: 'gameEffect',
        effectType: 'resolveFlankEngagement',
      };
    }
    // Defender rotated, flank engagement resolution should be complete
    // (but engagementState.completed should be set by the transform)
    throw new Error(
      'Flank engagement resolution complete but not marked as completed',
    );
  }
  if (engagementType === 'rear') {
    // If the engagement is from the rear, we need to rout the defending unit
    // Check if rout is completed
    if (!resolutionState.routState.completed) {
      return getExpectedRoutEvent(resolutionState.routState);
    }
    // Rout is complete, check if rear engagement resolution is complete
    if (resolutionState.completed) {
      throw new Error('Rear engagement resolution state is already complete');
    }
    // Rear engagement resolution should be complete
    throw new Error('Rear engagement resolution complete but not advanced');
  }
  if (engagementType === 'front') {
    const stage = getFrontEngagementStage(resolutionState);
    switch (stage) {
      case 'defenderCommitting': {
        // The defender may commit a card for the fight first (§6.3.2).
        return {
          actionType: 'playerChoice',
          choiceType: 'commitToMovement',
          playerSource: defendingPlayer,
        };
      }
      case 'retreatBeingWorkedOut': {
        return {
          actionType: 'gameEffect',
          effectType: 'resolveEngageRetreatOption',
        };
      }
      case 'noRetreat': {
        throw new Error('Defending unit cannot retreat');
      }
      case 'defenderDeciding': {
        return {
          actionType: 'playerChoice',
          choiceType: 'chooseWhetherToRetreat',
          playerSource: defendingPlayer,
        };
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
        return {
          actionType: 'gameEffect',
          effectType: 'openRetreatFromEngagement',
        };
      }
      case 'retreating': {
        return getExpectedRetreatEvent(
          throwIfPending(
            resolutionState.retreatState,
            'The retreat is not open',
          ),
        );
      }
      case 'retreated': {
        // applyResolveRetreat should have marked the engagement complete.
        throw new Error(
          'Front engagement retreat completed but engagement not marked as completed',
        );
      }
      default: {
        const _exhaustive: never = stage;
        throw new Error(`Invalid front engagement stage: ${_exhaustive}`);
      }
    }
  }
  throw new Error('Invalid engagement type');
}
