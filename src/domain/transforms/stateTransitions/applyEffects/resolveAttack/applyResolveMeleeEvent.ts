import type { ResolveMeleeEvent } from '@events';
import type { AttackResult, GameState } from '@game';
import { createAttackApplyState } from '@factories';
import {
  getMeleeResolutionState,
  getResolveMeleePhaseState,
  hasInitiative,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveMeleeEvent to the game state.
 * Creates AttackApplyStates for both players. A hit opens the matching rout, retreat, or reverse substep. An attack that reaches no threshold writes a completed apply with those slots `'bypassed'`.
 * TODO(misleading): resolve no longer opens substeps — the factory records which
 * outcomes are due as `'pending'` / `'bypassed'`, and openers write the substeps later.
 *
 * @param event - The resolve melee event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply states created for both players
 */
export function applyResolveMeleeEvent<S extends GameState>(
  event: ResolveMeleeEvent,
  state: S,
): S {
  const phaseState = getResolveMeleePhaseState(state);
  const meleeState = getMeleeResolutionState(state);

  // Each side's thresholds are independent measurements of the same exchange.
  const whiteAttackResult: AttackResult = {
    unitRetreated: event.whiteUnitRetreated,
    unitReversed: event.whiteUnitReversed,
    unitRouted: event.whiteUnitRouted,
  };

  const blackAttackResult: AttackResult = {
    unitRetreated: event.blackUnitRetreated,
    unitReversed: event.blackUnitReversed,
    unitRouted: event.blackUnitRouted,
  };

  // Only the factory decides which slots are due; no substep is written here.
  const whiteAttackApplyState = createAttackApplyState(
    event.whiteUnitWithPlacement.unit,
    whiteAttackResult,
  );
  const blackAttackApplyState = createAttackApplyState(
    event.blackUnitWithPlacement.unit,
    blackAttackResult,
  );

  // The event records what happened to each side's unit; the slots are named
  // for the order the applies resolve in, so each one is placed by its owner.
  const whiteIsFirst = hasInitiative(state, 'white');
  const newMeleeState = {
    ...meleeState,
    firstPlayerAttackApplyState: whiteIsFirst
      ? whiteAttackApplyState
      : blackAttackApplyState,
    secondPlayerAttackApplyState: whiteIsFirst
      ? blackAttackApplyState
      : whiteAttackApplyState,
  };

  const newPhaseState = {
    ...phaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return updatePhaseState(state, newPhaseState);
}
