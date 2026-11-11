import type { ValidationResult } from '@utils';
import type { PerformRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getLegalShooterTargets } from '@legality';
import { isSameUnitWithPlacement } from '@queries';
import { isValidRangedAttackSupporters } from './isValidRangedAttackSupporters';

/**
 * Validates a PerformRangedAttackEvent: the target and supporters for the
 * shooter its `chooseShooter` named, aimed after its commitment
 * (§4.3.11 steps 3–4).
 * - the shot is waiting for its target, and it is this player's shooter
 * - the target ∈ {@link getLegalShooterTargets}, the committed card's
 *   Range counted
 * - each supporter ∈ {@link getLegalRangedAttackSupporters} for that
 *   shooter and target, at its own Range; unique, and not the shooter
 */
export function isValidPerformRangedAttackEvent(
  event: PerformRangedAttackEvent,
  state: GameState,
): ValidationResult {
  // A target is named only once a shooter is named and has committed.
  const legal = getLegalShooterTargets(state);

  // Only the shooter's owner aims it.
  if (event.player !== legal.player) {
    return {
      errorReason: `Expected perform ranged attack from ${legal.player}, got ${event.player}`,
      result: false,
    };
  }

  // The target must be one the shooter can reach, its card counted.
  const target = legal.targets.find((candidate) =>
    isSameUnitWithPlacement(candidate, event.targetUnit),
  );
  if (target === undefined) {
    return {
      errorReason:
        'Target is not a legal ranged-attack defender for the attacker',
      result: false,
    };
  }

  // Each supporter must be able to make this shot itself (§7.3.4).
  const supportersValid = isValidRangedAttackSupporters(
    event.supportingUnits,
    legal.shooter,
    target,
    state,
  );
  if (!supportersValid.result) {
    return supportersValid;
  }

  return { result: true };
}
