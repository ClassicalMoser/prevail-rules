import type { CompleteMovementCommandEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import { getLegalMoveUnits } from '@legality';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Clears an in-progress movement CRS (or no-ops CRS already pending), then either:
 * - keeps only remaining units that can still legally start a move, or
 * - if none can move, clears that player's remaining units and advances the
 *   resolve step (first → second issue, second → complete).
 *
 * Used when resolve begins with remaining units that cannot move (e.g. engaged),
 * so the phase does not stall on `moveUnit`.
 */
export function applyCompleteMovementCommandEvent<S extends GameState>(
  _event: CompleteMovementCommandEvent,
  state: S,
): S {
  const phaseState = getIssueCommandsPhaseState(state);

  const clearedCrs: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: 'pending',
  };

  const provisional = updatePhaseState(state, clearedCrs);
  const legal = getLegalMoveUnits(provisional);

  if (legal !== null) {
    const moverUnits = legal.units.map((entry) => entry.unit);
    const isFirstPlayer = clearedCrs.step === 'firstPlayerResolveCommands';
    return updatePhaseState(state, {
      ...clearedCrs,
      remainingUnitsFirstPlayer: isFirstPlayer
        ? moverUnits
        : clearedCrs.remainingUnitsFirstPlayer,
      remainingUnitsSecondPlayer: isFirstPlayer
        ? clearedCrs.remainingUnitsSecondPlayer
        : moverUnits,
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
