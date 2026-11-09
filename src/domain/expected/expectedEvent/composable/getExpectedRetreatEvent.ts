import type { ExpectedEventInfo } from '@events';
import type { RetreatState } from '@game';
import { isBypassed, isPending } from '@utils';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for retreat substeps.
 * This is a composable function that can be used in any context where
 * retreat state appears (ranged attack resolution, etc.).
 *
 * @param retreatState - The retreat state
 * @returns Information about what event is expected
 */
export function getExpectedRetreatEvent(
  retreatState: RetreatState,
): ExpectedEventInfo {
  // Check if retreat is completed (all work done, ready for parent to handle)
  if (retreatState.completed) {
    throw new Error('Retreat state is already complete');
  }

  // Check if there are no legal retreat options
  if (retreatState.legalRetreatPaths.length === 0) {
    // If the rout state is not populated, trigger a rout from the retreat
    if (isPending(retreatState.routState)) {
      return {
        actionType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      };
    }
    // A retreat with nowhere to go must still rout — bypassed here is corrupt.
    if (isBypassed(retreatState.routState)) {
      throw new Error(
        'Retreat with no legal options cannot have a bypassed rout',
      );
    }
    // If the rout state is populated, check if it's completed
    if (!retreatState.routState.completed) {
      return getExpectedRoutEvent(retreatState.routState);
    }
    // Rout is complete, retreat should be complete too (but we already checked completed above)
    throw new Error(
      'Retreat state has completed rout but not marked as completed',
    );
  }

  // Check whether the retreat to carry out has been chosen
  if (retreatState.chosenRetreatPath === 'pending') {
    // Multiple retreat options exist - player must choose
    // If only one option exists, it is carried out as it stands (chosen when the retreat opens)
    if (retreatState.legalRetreatPaths.length === 1) {
      throw new Error(
        'A retreat with a single option should have it chosen when it opens',
      );
    }
    // Multiple options - player must choose
    return {
      actionType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      playerSource: retreatState.retreatingUnit.unit.playerSide,
    };
  }
  // The retreat is chosen (by the player, or as the only one)
  // Expect resolve retreat effect to move the unit
  return {
    actionType: 'gameEffect',
    effectType: 'resolveRetreat',
  };
}
