import type { ValidationResult } from '@utils';
import type { PerformRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getLegalShooterTargets } from '@legality';
import { isSameUnitInstance } from '@queries';
import { isValidRangedAttackSupporters } from './isValidRangedAttackSupporters';

/**
 * Validates a PerformRangedAttackEvent: the target and supporters for the
 * shooter its `chooseShooter` named, aimed after its commitment
 * (§4.3.11 steps 3–4).
 * - the shot is waiting for its target, and it is this player's shooter
 * - the target ∈ {@link getLegalShooterTargets}, the committed card's
 *   Range counted
 * - each supporter ∈ `getLegalRangedAttackSupporters` for that
 *   shooter and target, at its own Range; unique, and not the shooter
 */
export function isValidPerformRangedAttackEvent(
  event: PerformRangedAttackEvent,
  state: GameState,
): ValidationResult {
  // A target is named only once a shooter is named and has committed or
  // declined (§4.3.11 steps 1–2); asked at any other point, the enumerator
  // throws.
  const legal = getLegalShooterTargets(state);

  // Only the shooter's owner aims it.
  if (event.player !== legal.player) {
    const notTheirShot: ValidationResult = {
      errorReason: `Expected perform ranged attack from ${legal.player}, got ${event.player}`,
      result: false,
    };
    return notTheirShot;
  }

  // The target must be an unengaged enemy in the shooter's forward arc, out
  // to its Range with its committed card counted (§4.3.11 step 3, §7.4.2).
  // Named by who it is; the offer says where it stands.
  const target = legal.targets.find((candidate) =>
    isSameUnitInstance(candidate.unit, event.targetUnit),
  );
  if (target === undefined) {
    const notATarget: ValidationResult = {
      errorReason:
        'Target is not a legal ranged-attack defender for the attacker',
      result: false,
    };
    return notATarget;
  }

  // Each supporter must be able to make this shot itself (§7.3.4). With the
  // target allowed, the supporters' verdict is the event's.
  const supportersValid = isValidRangedAttackSupporters(
    event.supportingUnits,
    legal.shooter,
    target,
    state,
  );
  return supportersValid;
}
