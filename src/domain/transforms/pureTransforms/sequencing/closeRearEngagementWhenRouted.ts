import type { GameState } from '@game';
import { isNone, isPending } from '@utils';
import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * Ends a rear engagement once its rout is settled. A rear engagement is
 * nothing but the defender's rout (§6.3.3): when the Morale is paid — or
 * there was none to pay — the engagement is over and the move can finish.
 * Both ways a rout closes call this, so neither leaves the move hanging.
 *
 * Any other state passes through unchanged: a rout in a rally, a melee or
 * an attack has no rear engagement to end, and a rear rout still owed is
 * not over yet.
 *
 * @param state - The state just after a rout was written
 * @returns The state with the rear engagement marked complete, if its rout is
 */
export function closeRearEngagementWhenRouted<S extends GameState>(
  state: S,
): S {
  // Only a movement under way in the issue-commands phase can hold one.
  const phaseState = state.currentRoundState.currentPhaseState;
  if (isNone(phaseState) || phaseState.phase !== 'issueCommands') {
    return state;
  }
  const command = phaseState.currentCommandResolutionState;
  if (isPending(command) || command.commandResolutionType !== 'movement') {
    return state;
  }
  const engagement = command.engagementState;
  if (isPending(engagement)) {
    return state;
  }
  const resolution = engagement.engagementResolutionState;
  if (resolution.engagementType !== 'rear' || !resolution.routState.completed) {
    return state;
  }

  // The rout is paid: the rear engagement, and its resolution, are done.
  const closed = updateEngagementStateInMovement(state, {
    ...engagement,
    completed: true,
    engagementResolutionState: { ...resolution, completed: true },
  });
  return closed;
}
