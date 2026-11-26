import { createOpenedRangedAttackResolutionState } from '@factories';
import type { GameState, RangedAttackResolutionState } from '@game';
import { createTestUnit } from '@testing/unitHelpers';
import { completedCommitment } from './completedCommitment';

/**
 * A Black unit's shot at a White unit, aimed and committed to on both sides,
 * the blow not yet measured: the shot as it opens, carried on to that point.
 *
 * @param state - The game, for the cards both sides commit
 * @param overrides - What a spec sets beyond that
 * @returns The shot under way, for `createIssueCommandsPhaseState` to carry
 */
export function createRangedAttackResolutionState(
  state: GameState,
  overrides?: Partial<RangedAttackResolutionState>,
): RangedAttackResolutionState {
  // Stand-in units, not put on the board: a spec that needs them standing
  // somewhere places them and passes them here.
  const shooter = createTestUnit('black', { attack: 2 });
  const target = createTestUnit('white', { attack: 2 });

  const rangedAttack: RangedAttackResolutionState = {
    // The shot has not landed yet, so nothing has happened to the target.
    ...createOpenedRangedAttackResolutionState(shooter),
    // Black shoots, and has already committed (§4.3.11, step 2).
    attackingCommitment: completedCommitment(state.cardState.black.inPlay),
    // White is shot at, and has already committed for its defence (step 5).
    defendingCommitment: completedCommitment(state.cardState.white.inPlay),
    defendingUnit: target,
    // Nobody else from the order adds to the shot (§7.3.4).
    supportingUnits: [],
    ...overrides,
  };

  // The shot under way, for `createIssueCommandsPhaseState` to carry.
  return rangedAttack;
}
