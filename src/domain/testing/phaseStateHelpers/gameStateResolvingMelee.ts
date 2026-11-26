import type { PlayerSide } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';
import { createResolveMeleePhaseState } from './resolveMeleePhaseState';

/**
 * A game in Phase 4, fighting the melee a spec built, or with none chosen
 * yet (`'pending'`). Who holds the initiative decides whose unit is first and
 * whose second in it (§4.1.5), so a spec that depends on it says which.
 *
 * @param melee - The melee being fought
 * @param initiative - The side holding the initiative; White, as a new game
 * starts, unless the spec says otherwise
 * @returns An empty standard game fighting that melee
 */
export function createGameStateResolvingMelee(
  melee: MeleeResolutionState | 'pending',
  initiative: PlayerSide = 'white',
): GameState {
  // The empty game, with the initiative where the spec puts it.
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    initiative,
  );

  // Phase 4 on its one step, with this melee under way.
  const phase = createResolveMeleePhaseState(base, {
    currentMeleeResolutionState: melee,
  });
  const fighting = updatePhaseState(base, phase);
  return fighting;
}
