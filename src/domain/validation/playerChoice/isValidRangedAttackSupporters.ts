import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { ValidationResult } from '@utils';
import { getLegalRangedAttackSupporters } from '@legality';
import { hasUnitInArray, isSameUnitWithPlacement } from '@queries';

/**
 * Whether a shot's named supporters are all allowed (§7.3.4). Each must be
 * one of the units ordered by the same Shoot command that could make this
 * shot on its own; each is named once, since naming it spends its shot; and
 * the shooter cannot also support itself.
 *
 * @param supporters - The units the player named as supporters
 * @param attacker - The shooter, already validated
 * @param target - The target, already validated for that attacker
 * @param state - The current game state
 * @returns Success, or the first reason a supporter is not allowed
 */
export function isValidRangedAttackSupporters(
  supporters: readonly UnitWithPlacement[],
  attacker: UnitWithPlacement,
  target: UnitWithPlacement,
  state: GameState,
): ValidationResult {
  const legalSupporters = getLegalRangedAttackSupporters(
    attacker,
    target,
    state,
  );
  const named: UnitInstance[] = [];

  for (const supporter of supporters) {
    // Naming a supporter spends its shot, so it can be named only once.
    if (hasUnitInArray(named, supporter.unit)) {
      const duplicate: ValidationResult = {
        errorReason: 'Duplicate supporting unit',
        result: false,
      };
      return duplicate;
    }
    named.push(supporter.unit);

    // The shooter adds its own shot already; it cannot add +1 as well.
    if (isSameUnitWithPlacement(supporter, attacker).result) {
      const selfSupport: ValidationResult = {
        errorReason: 'Attacker cannot also be listed as a supporter',
        result: false,
      };
      return selfSupport;
    }

    // It must be able to make this same shot on its own.
    const isOffered = legalSupporters.some(
      (candidate) => isSameUnitWithPlacement(candidate, supporter).result,
    );
    if (!isOffered) {
      const cannotShoot: ValidationResult = {
        errorReason:
          'Supporting unit cannot independently ranged-attack the target',
        result: false,
      };
      return cannotShoot;
    }
  }

  const valid: ValidationResult = { result: true };
  return valid;
}
