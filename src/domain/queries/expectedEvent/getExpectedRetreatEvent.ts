import type { Board, ExpectedEventInfo, RetreatState } from '@entities';

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
  // Check if the final position has been determined
  if (retreatState.finalPosition === undefined) {
    // If there are multiple retreat options, player must choose
    // If no legal retreat, unit is routed (handled by rout state)
    return {
      actionType: 'playerChoice',
      playerSource: retreatState.retreatingUnit.unit.playerSide,
      choiceType: 'chooseRetreatOption',
    };
  }
  // Final position determined, expect resolve retreat effect
  return {
    actionType: 'gameEffect',
    effectType: 'resolveRetreat',
  };
}
