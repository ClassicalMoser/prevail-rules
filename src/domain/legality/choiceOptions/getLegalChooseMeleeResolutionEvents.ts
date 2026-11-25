import type { ChooseMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { createChooseMeleeResolutionEvent } from '@factories';
import {
  getCurrentInitiative,
  getRemainingMeleeEngagements,
  getResolveMeleePhaseState,
} from '@queries';
import { isPending } from '@utils';

/**
 * The engagements the first player may choose to fight next (§4.4.2). Every
 * engaged space fights this phase, and the first player picks the order, one
 * melee at a time; clearing one away can change the support in every fight
 * after it (§7.3.3), which is why the order is a choice.
 *
 * Nothing asks for the next melee while one is being fought, or once none is
 * left, so being asked then is the caller's mistake and throws.
 *
 * @param gameState - The game, in the resolve melee phase between melees
 * @returns One choice per engagement still to be fought, all the first player's
 * @throws Error outside the resolve melee step, while a melee is under way, or
 * when no engagement is left to choose
 */
export function getLegalChooseMeleeResolutionEvents(
  gameState: GameState,
): ChooseMeleeResolutionEvent[] {
  // The order is chosen only on the phase's fighting step.
  // TODO(misleading): the message says the phase is wrong, but here the phase
  // is right and its step is not (`getResolveMeleePhaseState` has already
  // refused a wrong phase). Settled by a message naming the step, as
  // `getLegalChooseCardOptions` does.
  const phaseState = getResolveMeleePhaseState(gameState);
  if (phaseState.step !== 'resolveMelee') {
    throw new Error('Not in resolve melee phase');
  }

  // The order of the melees is chosen between them: while one is being
  // fought, the next is not yet in question (§4.4.2). Nothing asks then, so
  // being asked is the caller's mistake.
  if (!isPending(phaseState.currentMeleeResolutionState)) {
    throw new Error(
      'A melee is under way; the next is chosen once it is resolved',
    );
  }

  // Get the active player
  // The first player, who holds the initiative, chooses the order (§4.4.2).
  const activePlayer = getCurrentInitiative(gameState);

  // Get the remaining engagements
  // Every engaged space fights this phase (§4.4.1); these are the ones not yet
  // fought.
  const remainingEngagementCoordinates =
    getRemainingMeleeEngagements(phaseState);

  // Build the result
  const result: ChooseMeleeResolutionEvent[] = [];

  // For each remaining engagement, add a legal choose melee resolution event
  for (const engagementCoordinate of remainingEngagementCoordinates) {
    result.push(
      createChooseMeleeResolutionEvent({
        player: activePlayer,
        space: engagementCoordinate,
      }),
    );
  }

  // If there are no legal choose melee resolution events,
  // We should have moved to the next step
  if (result.length === 0) {
    throw new Error('No legal choose melee resolution events');
  }

  // Build the result
  // What `isValidMeleeResolutionEvent` checks the first player's pick against.
  return result;
}
