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
  // A finished retreat has nothing left to ask for. Every parent checks for
  // that before calling here, so a call now is the parent's fault.
  if (retreatState.completed) {
    throw new Error('Retreat state is already complete');
  }

  // Check if there are no legal retreat options
  // A unit that must retreat and has nowhere to go routs instead (§9.1.6).
  // The rout takes the retreat's place, so it is carried out here, under the
  // retreat, rather than in the attack's own rout stage (§7.5.6).
  if (retreatState.legalRetreatPaths.length === 0) {
    // If the rout state is not populated, trigger a rout from the retreat
    // The unit leaves the board as this rout opens.
    if (isPending(retreatState.routState)) {
      const routInstead: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      };
      return routInstead;
    }
    // A retreat with nowhere to go must still rout — bypassed here is corrupt.
    if (isBypassed(retreatState.routState)) {
      throw new Error(
        'Retreat with no legal options cannot have a bypassed rout',
      );
    }
    // If the rout state is populated, check if it's completed
    // The rout is open: its owner still owes the unit's Morale (§9.3.2).
    if (!retreatState.routState.completed) {
      const payForRout = getExpectedRoutEvent(retreatState.routState);
      return payForRout;
    }
    // Rout is complete, retreat should be complete too (but we already checked completed above)
    // Paying for the rout closes the retreat in the same write (`settleRout`),
    // so a paid rout under an open retreat is a fault there.
    throw new Error(
      'Retreat state has completed rout but not marked as completed',
    );
  }

  // Check whether the retreat to carry out has been chosen
  // A retreat is the smallest backward move, and where several tie the
  // owner chooses among them (§9.1.3).
  if (isPending(retreatState.chosenRetreatPath)) {
    // Multiple retreat options exist - player must choose
    // If only one option exists, it is carried out as it stands (chosen when the retreat opens)
    if (retreatState.legalRetreatPaths.length === 1) {
      throw new Error(
        'A retreat with a single option should have it chosen when it opens',
      );
    }
    // Multiple options - player must choose
    // The retreating unit's owner picks one, not the side that struck it.
    const chooseRetreat: ExpectedEventInfo = {
      actionType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      playerSource: retreatState.retreatingUnit.playerSide,
    };
    return chooseRetreat;
  }
  // The retreat is chosen (by the player, or as the only one)
  // Expect resolve retreat effect to move the unit
  // Moving it along the chosen path, with any commander in its space going
  // too (§9.1.8), is the engine's work.
  const fallBack: ExpectedEventInfo = {
    actionType: 'gameEffect',
    effectType: 'resolveRetreat',
  };
  return fallBack;
}
