import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getPositionOfUnit,
  modifiersFromCompletedCommitment,
  findRangedAttackResolutionState,
} from '@queries';
import { getLegalRangedAttackTargets } from './getLegalRangedAttackOptions';

/**
 * What a named shooter may aim at, once its card is committed or refused:
 * the shooting player, the shooter where it stands, and every enemy it may
 * target with that card counted (§4.3.11 step 3).
 *
 * Supporters for a chosen target are enumerated by
 * {@link getLegalRangedAttackSupporters}.
 */
export interface LegalShooterTargets {
  /** The player carrying out the Shoot order. */
  player: PlayerSide;
  /** The unit named to shoot, and where it stands. */
  shooter: UnitWithPlacement;
  /** Every enemy in its forward arc, out to its Range with the card counted. */
  targets: readonly UnitWithPlacement[];
}

/**
 * Returns the targets open to the shooter of the shot under way, or `null`
 * when no shot is waiting for its target: no ranged attack is open, its
 * shooter has not yet committed or refused, or the target is already named.
 *
 * The shooter commits before it aims (§4.3.11 step 2), and its card counts
 * here: a Range card reaches one space further out, adding any enemy just
 * beyond its own Range. It never gives a shot to a unit with none: only a
 * unit with a target at its own Range is named to shoot (§4.3.11 step 1).
 */
export function getLegalShooterTargets<S extends GameState>(
  gameState: S,
): LegalShooterTargets | null {
  // Shots are taken only while a Shoot order is being carried out.
  const resolution = findRangedAttackResolutionState(gameState);
  if (resolution === undefined) {
    return null;
  }

  // The target is named after the shooter's commitment, and only once.
  if (
    resolution.attackingCommitment.commitmentType === 'pending' ||
    resolution.defendingUnit !== 'pending'
  ) {
    return null;
  }

  // The shooter does not move during its shot, so where the board has it is
  // where it shoots from.
  const shootingUnit = resolution.attackingUnit;
  const placement = getPositionOfUnit(gameState.boardState, shootingUnit);
  const shooter: UnitWithPlacement = { placement, unit: shootingUnit };

  // Its committed card, if any, counts toward its Range (§4.3.11 step 2).
  const committed = modifiersFromCompletedCommitment(
    resolution.attackingCommitment,
  );
  const targets = getLegalRangedAttackTargets(shooter, gameState, committed);

  const legal: LegalShooterTargets = {
    shooter,
    player: shootingUnit.playerSide,
    targets,
  };
  return legal;
}
