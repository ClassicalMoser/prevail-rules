import { createOpenedResolveMeleePhaseState } from '@factories';
import type { GameState, ResolveMeleePhaseState } from '@game';
import { createMeleeResolutionState } from './meleeResolutionState';

/**
 * Phase 4 with a melee under way: the phase as it opens, with no other
 * engaged space waiting, and one melee chosen and committed to.
 *
 * @param state - The game, whose initiative orders the melee's blows
 * @param overrides - What a spec sets beyond that
 * @returns The Resolve Melee phase, to put in a game with `updatePhaseState`
 */
export function createResolveMeleePhaseState(
  state: GameState,
  overrides?: Partial<ResolveMeleePhaseState>,
): ResolveMeleePhaseState {
  const resolveMelee: ResolveMeleePhaseState = {
    // No other engaged space is waiting to fight after this one (§4.4.2).
    ...createOpenedResolveMeleePhaseState([]),
    // One melee under way, both commitments made, so a spec starts at the
    // blows.
    currentMeleeResolutionState: createMeleeResolutionState(state),
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return resolveMelee;
}
