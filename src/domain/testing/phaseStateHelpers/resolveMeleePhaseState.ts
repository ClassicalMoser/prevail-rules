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
    currentMeleeResolutionState: createMeleeResolutionState(state),
    phase: RESOLVE_MELEE_PHASE,
    remainingEngagements: [],
    step: 'resolveMelee',
    ...overrides,
  };
  return resolveMelee;
}
