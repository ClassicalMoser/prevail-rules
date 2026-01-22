import type { Board, ExpectedEventInfo, RetreatState } from '@entities';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for retreat substeps.
 * This is a composable function that can be used in any context where
 * retreat state appears (ranged attack resolution, etc.).
 *
 * @param retreatState - The retreat state
 * @returns Information about what event is expected
 */
export function getExpectedRetreatEvent<TBoard extends Board>(
  retreatState: RetreatState<TBoard>,
): ExpectedEventInfo<TBoard> {
  // Check if retreat is completed (all work done, ready for parent to handle)
  if (retreatState.completed) {
    throw new Error('Retreat state is already complete');
  }

  // Check if there are no legal retreat options
  if (retreatState.legalRetreatOptions.size === 0) {
    // If the rout state is not populated, trigger a rout from the retreat
    if (!retreatState.routState) {
      return {
        actionType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      };
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

  // Check if the final position has been determined
  if (retreatState.finalPosition === undefined) {
    // Multiple retreat options exist - player must choose
    // If only one option exists, it should be auto-selected (finalPosition set) when state is created
    if (retreatState.legalRetreatOptions.size === 0) {
      throw new Error(
        'RetreatState with no legal retreat options should have routState populated',
      );
    }
    if (retreatState.legalRetreatOptions.size === 1) {
      throw new Error(
        'RetreatState with single option should have finalPosition set immediately',
      );
    }
    // Multiple options - player must choose
    return {
      actionType: 'playerChoice',
      playerSource: retreatState.retreatingUnit.unit.playerSide,
      choiceType: 'chooseRetreatOption',
    };
  }
  // Final position determined (either by player choice or auto-selected if single option)
  // Expect resolve retreat effect to move the unit
  return {
    actionType: 'gameEffect',
    effectType: 'resolveRetreat',
  };
}
