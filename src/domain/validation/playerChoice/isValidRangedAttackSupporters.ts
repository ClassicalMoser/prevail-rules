import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { ValidationResult } from '@utils';
import { getLegalRangedAttackSupporters } from '@legality';
import { hasUnitInArray, isSameUnitInstance } from '@queries';

// TODO(composition): the supporters are a choice made a part at a time, like
// the units of a units order, but this checks them by hand: a list from
// @legality, then duplicates and the shooter refused here. The shooter is
// already left out of getLegalRangedAttackSupporters, so the self-support
// check only words a sharper refusal. Settled by @legality offering the
// supporters as an `OpenChoice`, this validator walking them with
// `findIllegal`, and a supporters refusal reason in @legality wording why,
// as getUnitsOrderRefusalReason does for a units order.
/**
 * Whether a shot's named supporters are all allowed (§7.3.4). Each must be
 * one of the units ordered by the same Shoot command that could make this
 * shot on its own; each is named once, since naming it spends its shot; and
 * the shooter cannot also support itself.
 *
 * @param supporters - The units the player named as supporters, by who they are
 * @param attacker - The shooter, already validated
 * @param target - The target, already validated for that attacker
 * @param state - The current game state
 * @returns Success, or the first reason a supporter is not allowed
 */
export function isValidRangedAttackSupporters(
  supporters: readonly UnitInstance[],
  attacker: UnitWithPlacement,
  target: UnitWithPlacement,
  state: GameState,
): ValidationResult {
  // Every unit of the shooter's Shoot order still to act that could make
  // this same shot on its own, at its own Range: the shooter's card does not
  // reach them (§4.3.11 step 4).
  const legalSupporters = getLegalRangedAttackSupporters(
    attacker,
    target,
    state,
  );

  // The supporters accepted so far, so a second naming of one is caught.
  const named: UnitInstance[] = [];

  for (const supporter of supporters) {
    // Naming a supporter spends its shot, so it can be named only once.
    if (hasUnitInArray(named, supporter)) {
      const duplicate: ValidationResult = {
        errorReason: 'Duplicate supporting unit',
        result: false,
      };
      return duplicate;
    }
    named.push(supporter);

    // The shooter adds its own shot already; it cannot add +1 as well.
    if (isSameUnitInstance(supporter, attacker.unit)) {
      const selfSupport: ValidationResult = {
        errorReason: 'Attacker cannot also be listed as a supporter',
        result: false,
      };
      return selfSupport;
    }

    // It must be able to make this same shot on its own.
    const isOffered = legalSupporters.some((candidate) =>
      isSameUnitInstance(candidate.unit, supporter),
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

  // Every supporter named may add its +1 to the shot.
  const valid: ValidationResult = { result: true };
  return valid;
}
