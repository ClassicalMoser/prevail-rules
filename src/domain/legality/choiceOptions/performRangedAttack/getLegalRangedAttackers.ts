import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getCurrentUnitStat,
  getIssueCommandsPhaseState,
  getOtherPlayer,
  findPositionOfUnit,
  isFriendlyUnit,
  getRemainingUnitsForPlayer,
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
 */
export interface LegalRangedAttackers {
  player: PlayerSide;
  /**
   * Remaining commanded units that may shoot at ≥1 legal target. Empty when
   * none can, which ends the order with no shot taken.
   */
  attackers: readonly UnitWithPlacement[];
}

/**
 * Returns legal ranged attackers when issueCommands awaits the start of a
 * ranged command resolution (CRS pending, remaining units, ranged card in play).
 *
 * Nobody able to shoot is a real answer, an empty list, and the order ends
 * without a shot. Being asked outside the start of a ranged order is the
 * caller's mistake and throws.
 *
 * @throws Error outside the issue commands phase, off a resolve step, while a
 * command is already being resolved, or when the card in play is not a
 * ranged attack order
 */
export function getLegalRangedAttackers<S extends GameState>(
  gameState: S,
): LegalRangedAttackers {
  const phaseState = getIssueCommandsPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerResolveCommands' &&
    phaseState.step !== 'secondPlayerResolveCommands'
  ) {
    throw new Error(`Not on a resolve commands step: ${phaseState.step}`);
  }
  if (phaseState.currentCommandResolutionState !== 'pending') {
    throw new Error('A command is already being resolved');
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const player =
    phaseState.step === 'firstPlayerResolveCommands'
      ? firstPlayer
      : secondPlayer;
  const remainingUnits = getRemainingUnitsForPlayer(gameState, player);

  // The order is the card the player has in play, which lies face up for
  // every viewer (§4.1.2): a seat reads it as plainly as the player does. Only
  // the hand is hidden, and the order does not come from the hand.
  const inPlay = gameState.cardState[player].inPlay;
  if (inPlay === null || inPlay.command.type !== 'rangedAttack') {
    throw new Error(
      `The card ${player} has in play is not a ranged attack order`,
    );
  }

  const attackers: UnitWithPlacement[] = [];
  for (const unit of remainingUnits) {
    if (!isFriendlyUnit(unit, player)) {
      continue;
    }
    // A unit routed earlier is still listed but no longer on the board.
    const placement = findPositionOfUnit(gameState.boardState, unit);
    if (placement === undefined) {
      continue;
    }
    const unitWithPlacement: UnitWithPlacement = { placement, unit };
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

  const legal: LegalRangedAttackers = { attackers, player };
  return legal;
}
