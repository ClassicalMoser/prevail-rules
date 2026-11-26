import type { GameState, ResolveMeleePhaseState } from '@game';
import { RESOLVE_MELEE_PHASE } from '@game';
import { createMeleeResolutionState } from './meleeResolutionState';

/**
 * Creates a ResolveMeleePhaseState with sensible defaults.
 */
export function createResolveMeleePhaseState(
  state: GameState,
  overrides?: Partial<ResolveMeleePhaseState>,
): ResolveMeleePhaseState {
  const resolveMelee: ResolveMeleePhaseState = {
    // One melee under way, both commitments made, so a spec starts at the
    // blows.
    currentMeleeResolutionState: createMeleeResolutionState(state),
    phase: RESOLVE_MELEE_PHASE,
    // No other engaged space is waiting to fight after this one (§4.4.2).
    remainingEngagements: [],
    step: 'resolveMelee',
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return resolveMelee;
}
