import type { Command, PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import {
  getLegalMoveUnits,
  getLegalRangedAttackers,
  isCommandIssuable,
} from '@legality';
import { getIssueCommandsPhaseState, getOtherPlayer } from '@queries';
import { getExpectedStartCommandResolutionEvent } from '../composable';
import { getExpectedCommandResolutionEvent } from '../iterated';

/**
 * When resolving a ranged command with remaining units but none that have a
 * legal target, expect `completeRangedAttackCommand` so apply can clear those
 * units and advance the step instead of stalling on `performRangedAttack`.
 */
function getExpectedRangedResolveStart(
  state: GameState,
  player: 'black' | 'white',
): ExpectedEventInfo {
  const legal = getLegalRangedAttackers(state);
  if (legal === null) {
    return {
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    };
  }
  return getExpectedStartCommandResolutionEvent(state, player);
}

/**
 * When resolving a movement command with remaining units but none that can
 * legally start a move (e.g. all engaged), expect `completeMovementCommand`
 * so apply can clear those units and advance instead of stalling on `moveUnit`.
 */
function getExpectedMovementResolveStart(
  state: GameState,
  player: 'black' | 'white',
): ExpectedEventInfo {
  const legal = getLegalMoveUnits(state);
  if (legal === null) {
    return {
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    };
  }
  return getExpectedStartCommandResolutionEvent(state, player);
}

/**
 * While remaining slots exist: prefer `issueCommand` if any slot is still
 * issuable; otherwise `doneIssuingCommands` so the phase cannot stall.
 * (`doneIssuingCommands` is also accepted when `issueCommand` is expected.)
 */
function getExpectedIssueStepEvent(
  state: GameState,
  player: PlayerSide,
  remainingCommands: readonly Command[],
): ExpectedEventInfo {
  const anyIssuable = remainingCommands.some((command) =>
    isCommandIssuable(command, player, state),
  );
  if (anyIssuable) {
    return {
      actionType: 'playerChoice',
      choiceType: 'issueCommand',
      playerSource: player,
    };
  }
  return {
    actionType: 'playerChoice',
    choiceType: 'doneIssuingCommands',
    playerSource: player,
  };
}

/**
 * Gets information about the expected event for the Issue Commands phase.
 *
 * @param state - The current game state with Issue Commands phase
 * @returns Information about what event is expected
 */
export function getExpectedIssueCommandsPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  const phaseState = getIssueCommandsPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'firstPlayerIssueCommands': {
      if (phaseState.remainingCommandsFirstPlayer.length > 0) {
        return getExpectedIssueStepEvent(
          state,
          firstPlayer,
          phaseState.remainingCommandsFirstPlayer,
        );
      }
      // All commands issued - should have advanced to firstPlayerResolveCommands
      // This state should not occur if applyIssueCommandEvent properly advances steps
      throw new Error(
        'All first player commands issued but step not advanced to firstPlayerResolveCommands',
      );
    }

    case 'firstPlayerResolveCommands': {
      // Check if there's an ongoing command resolution
      if (phaseState.currentCommandResolutionState !== 'pending') {
        return getExpectedCommandResolutionEvent(
          state,
          phaseState.currentCommandResolutionState,
          firstPlayer,
        );
      }

      // No ongoing resolution - check if there are remaining units to resolve
      if (phaseState.remainingUnitsFirstPlayer.length > 0) {
        const inPlay = state.cardState[firstPlayer].inPlay;
        if (inPlay?.command.type === 'rangedAttack') {
          return getExpectedRangedResolveStart(state, firstPlayer);
        }
        return getExpectedMovementResolveStart(state, firstPlayer);
      }

      // Empty remaining after ranged resolve: advance via completeRangedAttackCommand
      if (
        state.cardState[firstPlayer].inPlay?.command.type === 'rangedAttack'
      ) {
        return {
          actionType: 'gameEffect',
          effectType: 'completeRangedAttackCommand',
        };
      }

      // Empty remaining after movement resolve with no movers: complete command
      if (state.cardState[firstPlayer].inPlay?.command.type === 'movement') {
        return {
          actionType: 'gameEffect',
          effectType: 'completeMovementCommand',
        };
      }

      // All units resolved - should have advanced to secondPlayerIssueCommands
      throw new Error(
        'All first player units resolved but step not advanced to secondPlayerIssueCommands',
      );
    }

    case 'secondPlayerIssueCommands': {
      if (phaseState.remainingCommandsSecondPlayer.length > 0) {
        return getExpectedIssueStepEvent(
          state,
          secondPlayer,
          phaseState.remainingCommandsSecondPlayer,
        );
      }
      // All commands issued - should have advanced to secondPlayerResolveCommands
      throw new Error(
        'All second player commands issued but step not advanced to secondPlayerResolveCommands',
      );
    }

    case 'secondPlayerResolveCommands': {
      // Check if there's an ongoing command resolution
      if (phaseState.currentCommandResolutionState !== 'pending') {
        return getExpectedCommandResolutionEvent(
          state,
          phaseState.currentCommandResolutionState,
          secondPlayer,
        );
      }

      // No ongoing resolution - check if there are remaining units to resolve
      if (phaseState.remainingUnitsSecondPlayer.length > 0) {
        const inPlay = state.cardState[secondPlayer].inPlay;
        if (inPlay?.command.type === 'rangedAttack') {
          return getExpectedRangedResolveStart(state, secondPlayer);
        }
        return getExpectedMovementResolveStart(state, secondPlayer);
      }

      if (
        state.cardState[secondPlayer].inPlay?.command.type === 'rangedAttack'
      ) {
        return {
          actionType: 'gameEffect',
          effectType: 'completeRangedAttackCommand',
        };
      }

      if (state.cardState[secondPlayer].inPlay?.command.type === 'movement') {
        return {
          actionType: 'gameEffect',
          effectType: 'completeMovementCommand',
        };
      }

      // All units resolved - should have advanced to complete
      throw new Error(
        'All second player units resolved but step not advanced to complete',
      );
    }

    case 'complete': {
      return {
        actionType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
      };
    }

    default: {
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid issueCommands phase state: ${_exhaustive}`);
    }
  }
}
