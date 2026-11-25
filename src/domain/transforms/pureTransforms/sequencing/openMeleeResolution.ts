import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import { createOpenedMeleeResolutionState } from '@factories';
import { getResolveMeleePhaseState } from '@queries';
import { isPending } from '@utils';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Begins fighting the melee at a space: it leaves the engagements still
 * waiting, and its resolution opens (§4.4.2). Melees are fought one at a
 * time, so none may already be under way.
 *
 * @param state - The game state, resolving melees
 * @param space - The engaged space chosen to be fought next
 * @returns The game state with that melee under way
 * @throws Error when another melee is already under way
 */
export function openMeleeResolution<S extends GameState>(
  state: S,
  space: Coordinate,
): S {
  // Melees are only fought in Phase 4; asked elsewhere, this throws.
  const phaseState = getResolveMeleePhaseState(state);

  // The first player resolves each engagement completely before choosing
  // the next (§4.4.2), so one still open means it was never cleared: a fault
  // in the sequence.
  if (!isPending(phaseState.currentMeleeResolutionState)) {
    throw new Error('A melee is already being resolved');
  }

  // The chosen space is fought now and no longer waits; its melee opens
  // with nothing committed and nothing measured yet (§7.2.2). That the space
  // was among those waiting is validation's to check, not this writer's.
  const opened = createOpenedMeleeResolutionState(space);
  const stillWaiting = phaseState.remainingEngagements.filter(
    (waiting) => waiting !== space,
  );
  const updated = updatePhaseState(state, {
    ...phaseState,
    currentMeleeResolutionState: opened,
    remainingEngagements: stillWaiting,
  });

  // Phase 4 with that melee being fought.
  return updated;
}
