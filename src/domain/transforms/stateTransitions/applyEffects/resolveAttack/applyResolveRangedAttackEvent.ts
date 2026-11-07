import type { ResolveRangedAttackEvent } from '@events';
import type {
  AttackResult,
  GameState,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
} from '@game';
import { createAttackApplyState } from '@factories';
import {
  getIssueCommandsPhaseState,
  getRangedAttackResolutionState,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveRangedAttackEvent to the game state.
 * Creates the AttackApplyState with nested substeps (rout/retreat/reverse) based on the attack results.
 * TODO(misleading): resolve no longer opens substeps — the factory records which
 * outcomes are due as `'pending'` / `'bypassed'`, and openers write the substeps later.
 *
 * @param event - The resolve ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply state created
 */
export function applyResolveRangedAttackEvent<S extends GameState>(
  event: ResolveRangedAttackEvent,
  state: S,
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const rangedAttackState = getRangedAttackResolutionState(state);

  const defendingUnit = event.defenderWithPlacement.unit;

  // The procedure measured which thresholds this attack cleared.
  const attackResult: AttackResult = {
    unitRetreated: event.retreated,
    unitReversed: event.reversed,
    unitRouted: event.routed,
  };

  // Only the factory decides which slots are due; no substep is written here.
  const attackApplyState = createAttackApplyState(defendingUnit, attackResult);

  const newRangedAttackState: RangedAttackResolutionState = {
    ...rangedAttackState,
    attackApplyState,
  };

  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: newRangedAttackState,
  };

  return updatePhaseState(state, newPhaseState);
}
