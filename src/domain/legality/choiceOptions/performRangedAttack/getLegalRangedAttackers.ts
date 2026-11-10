import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getCurrentUnitStat,
  getOtherPlayer,
  getOwnedPlayerCardState,
  getPositionOfUnit,
  isFriendlyUnit,
} from '@queries';

import { isUnengagedUnit } from './canUnitRangedAttackTarget';
import { getLegalRangedAttackTargets } from './getLegalRangedAttackOptions';

/**
 * The units a Shoot order may shoot with next (`chooseShooter`, §4.3.11 step
 * 1): which player is carrying out the order, and which of its ordered
 * units still to act may be named as the shooter.
 *
 * Only units with at least one legal target are included — otherwise the
 * orchestrator would wait forever on an empty target list. That target is
 * judged at the unit's own Range: a Range card committed afterwards may
 * extend the choice, but is not counted in deciding whether a unit may shoot
 * at all (§4.3.11 step 1; author, 2026-11-09: kept simple for now).
 *
 * Targets / supporters are enumerated once the shooter is named and its card
 * committed, via {@link getLegalShooterTargets} /
 * {@link getLegalRangedAttackSupporters}.
 *
 * `null` when a chooseShooter choice is not expected (or no remaining
 * unit can currently shoot at anyone).
 */
export interface LegalRangedAttackers {
  player: PlayerSide;
  /** Remaining commanded units that may shoot at ≥1 legal target. */
  attackers: readonly UnitWithPlacement[];
}

/**
 * Returns legal ranged attackers when issueCommands awaits the start of a
 * ranged command resolution (CRS pending, remaining units, ranged card in play).
 */
export function getLegalRangedAttackers<S extends GameState>(
  gameState: S,
): LegalRangedAttackers | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'issueCommands') {
    return null;
  }
  if (
    phaseState.step !== 'firstPlayerResolveCommands' &&
    phaseState.step !== 'secondPlayerResolveCommands'
  ) {
    return null;
  }
  if (phaseState.currentCommandResolutionState !== 'pending') {
    return null;
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const player =
    phaseState.step === 'firstPlayerResolveCommands'
      ? firstPlayer
      : secondPlayer;
  const remainingUnits =
    phaseState.step === 'firstPlayerResolveCommands'
      ? phaseState.remainingUnitsFirstPlayer
      : phaseState.remainingUnitsSecondPlayer;

  if (remainingUnits.length === 0) {
    return null;
  }

  let inPlay;
  try {
    inPlay = getOwnedPlayerCardState(gameState.cardState, player).inPlay;
  } catch {
    return null;
  }
  if (inPlay === null || inPlay.command.type !== 'rangedAttack') {
    return null;
  }

  const attackers: UnitWithPlacement[] = [];
  for (const unit of remainingUnits) {
    if (!isFriendlyUnit(unit, player)) {
      continue;
    }
    let unitWithPlacement: UnitWithPlacement;
    try {
      const placement = getPositionOfUnit(gameState.boardState, unit);
      unitWithPlacement = { placement, unit };
    } catch {
      continue;
    }
    if (!isUnengagedUnit(gameState, unitWithPlacement)) {
      continue;
    }
    if (getCurrentUnitStat(unit, 'range', gameState) <= 0) {
      continue;
    }
    // A unit with nothing to shoot at is skipped (§4.3.11 step 1). Asked at
    // its own Range: a Range card it might commit is not counted, so a
    // commitment can carry a shot further but never give a unit one
    // (author, 2026-11-09).
    if (
      getLegalRangedAttackTargets(unitWithPlacement, gameState).length === 0
    ) {
      continue;
    }
    attackers.push(unitWithPlacement);
  }

  if (attackers.length === 0) {
    return null;
  }

  return { attackers, player };
}
