import type { CompleteRangedAttackCommandEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import { getLegalRangedAttackers } from '@legality';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Clears an in-progress ranged CRS (or no-ops CRS already pending), then either:
 * - keeps only remaining units that still have a legal target, or
 * - if none can fire, clears that player's remaining units and advances the
 *   resolve step (first → second issue, second → complete).
 *
 * Also used when resolve begins with remaining units that have range but no
 * eligible targets, so the phase does not stall on `performRangedAttack`.
 */
export function applyCompleteRangedAttackCommandEvent<S extends GameState>(
  _event: CompleteRangedAttackCommandEvent,
  state: S,
): S {
  const phaseState = getIssueCommandsPhaseState(state);

  const clearedCrs: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: 'pending',
  };

  const provisional = updatePhaseState(state, clearedCrs);
  const legal = getLegalRangedAttackers(provisional);

  if (legal !== null) {
    const attackerUnits = legal.attackers.map((attacker) => attacker.unit);
    const isFirstPlayer = clearedCrs.step === 'firstPlayerResolveCommands';
    return updatePhaseState(state, {
      ...clearedCrs,
      remainingUnitsFirstPlayer: isFirstPlayer
        ? attackerUnits
        : clearedCrs.remainingUnitsFirstPlayer,
      remainingUnitsSecondPlayer: isFirstPlayer
        ? clearedCrs.remainingUnitsSecondPlayer
        : attackerUnits,
    });
  }

  if (clearedCrs.step === 'firstPlayerResolveCommands') {
    return updatePhaseState(state, {
      ...clearedCrs,
      remainingUnitsFirstPlayer: [],
      step: 'secondPlayerIssueCommands',
    });
  }

  if (clearedCrs.step === 'secondPlayerResolveCommands') {
    return updatePhaseState(state, {
      ...clearedCrs,
      remainingUnitsSecondPlayer: [],
      step: 'complete',
    });
  }

  return provisional;
}
