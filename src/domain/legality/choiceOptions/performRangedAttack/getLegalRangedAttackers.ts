import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getCardInPlay,
  getCommandingPlayer,
  getCurrentUnitStat,
  getIssueCommandsPhaseState,
  findPositionOfUnit,
  isFriendlyUnit,
  getRemainingUnitsForPlayer,
} from '@queries';
import { isResolved } from '@utils';

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
 * committed, via `getLegalShooterTargets` /
 * `getLegalRangedAttackSupporters`.
 */
export interface LegalRangedAttackers {
  /** The player carrying out the Shoot order. */
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
 * The expected engine asks this before each shot, and when the list is
 * empty it ends the order instead of waiting on `chooseShooter`; validation
 * checks a named shooter against it.
 *
 * @param gameState - The game, in Phase 3 between shots of a Shoot order
 * @returns The player carrying out the order, and each unit it may name to shoot
 * @throws Error outside the issue commands phase, off a resolve step, while a
 * command is already being resolved, or when the card in play is not a
 * ranged attack order
 */
export function getLegalRangedAttackers<S extends GameState>(
  gameState: S,
): LegalRangedAttackers {
  // Shots are taken while a player carries out their orders, after issuing
  // them all (§4.3); on an issuing step there is no order to shoot with yet.
  const phaseState = getIssueCommandsPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerResolveCommands' &&
    phaseState.step !== 'secondPlayerResolveCommands'
  ) {
    throw new Error(`Not on a resolve commands step: ${phaseState.step}`);
  }

  // A shooter is named between shots: each unit finishes before the next
  // begins (§4.3.9), so none is named while a shot is under way.
  if (isResolved(phaseState.currentCommandResolutionState)) {
    throw new Error('A command is already being resolved');
  }

  // The player whose resolve step this is, and the units their order has
  // still to act.
  const player = getCommandingPlayer(gameState);
  const remainingUnits = getRemainingUnitsForPlayer(gameState, player);

  // The order is the card the player has in play, which lies face up for
  // every viewer (§4.1.2): a seat reads it as plainly as the player does. Only
  // the hand is hidden, and the order does not come from the hand.
  const inPlay = getCardInPlay(gameState.cardState, player);
  if (inPlay.command.type !== 'rangedAttack') {
    throw new Error(
      `The card ${player} has in play is not a ranged attack order`,
    );
  }

  const attackers: UnitWithPlacement[] = [];
  for (const unit of remainingUnits) {
    // TODO(wrong): the order's units still to act are this player's own by
    // construction, so this soft guard can only hide a fault in the state
    // (DESIGN.md: a soft second guard hides a fault in the first). Settle by
    // removing it, or by throwing on a unit of the other side.
    if (!isFriendlyUnit(unit, player)) {
      continue;
    }

    // A unit routed earlier is still listed but no longer on the board.
    // TODO(misleading): shots are one way (§7.4.4) and nothing in a player's
    // own Shoot order removes one of their units, so no unit still to act is
    // off the board in play. Settle by stating the real reason for the find,
    // or asking `getPositionOfUnit`, which throws.
    const placement = findPositionOfUnit(gameState, unit);
    if (placement === undefined) {
      continue;
    }
    const unitWithPlacement: UnitWithPlacement = { placement, unit };

    // The shooter must be unengaged and have Range (§4.3.11 step 1, §7.4.1).
    // `canUnitRangedAttackTarget` asks both again for each target; asking
    // here first passes over a unit that cannot shoot at all without looking
    // across the board for targets.
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

    // Unengaged, with Range and something to shoot at: it may be named.
    attackers.push(unitWithPlacement);
  }

  // The player carrying out the order, and every unit they may name next;
  // empty when none can shoot, which ends the order with no shot taken.
  const legal: LegalRangedAttackers = { attackers, player };
  return legal;
}
