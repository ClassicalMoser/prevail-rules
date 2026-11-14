import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getLegalMoveUnits, getLegalRangedAttackers } from '@legality';
import {
  getCardInPlay,
  getIssueCommandsPhaseState,
  getOtherPlayer,
} from '@queries';
import { getExpectedStartCommandResolutionEvent } from '../composable';
import { getExpectedCommandResolutionEvent } from '../iterated';

/**
 * When a shooter is to be chosen and none of the units still to act has a
 * legal target, expect `completeRangedAttackCommand`: those units are skipped
 * (§4.3.11 step 1) and the order ends, instead of stalling on `chooseShooter`.
 * A unit with no target now stays in the order while another may still shoot.
 */
function getExpectedRangedResolveStart(
  state: GameState,
  player: 'black' | 'white',
): ExpectedEventInfo {
  const legal = getLegalRangedAttackers(state);
  if (legal.attackers.length === 0) {
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
  if (legal.units.length === 0) {
    return {
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    };
  }
  return getExpectedStartCommandResolutionEvent(state, player);
}

/**
 * While orders are left, the player is asked for the next one. Stopping is
 * the same choice with no order (§4.3.3), so the expectation is the same
 * whether or not any order can still be given; when none can, stopping is
 * the only legal option, and the phase cannot stall.
 */
function getExpectedIssueStepEvent(player: PlayerSide): ExpectedEventInfo {
  const expected: ExpectedEventInfo = {
    actionType: 'playerChoice',
    choiceType: 'issueCommand',
    playerSource: player,
  };
  return expected;
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
        return getExpectedIssueStepEvent(firstPlayer);
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
        const { command } = getCardInPlay(state.cardState, firstPlayer);
        if (command.type === 'rangedAttack') {
          return getExpectedRangedResolveStart(state, firstPlayer);
        }
        return getExpectedMovementResolveStart(state, firstPlayer);
      }

      // Empty remaining after ranged resolve: advance via completeRangedAttackCommand
      if (
        getCardInPlay(state.cardState, firstPlayer).command.type ===
        'rangedAttack'
      ) {
        return {
          actionType: 'gameEffect',
          effectType: 'completeRangedAttackCommand',
        };
      }

      // Empty remaining after movement resolve with no movers: complete command
      if (
        getCardInPlay(state.cardState, firstPlayer).command.type === 'movement'
      ) {
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
        return getExpectedIssueStepEvent(secondPlayer);
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
        const { command } = getCardInPlay(state.cardState, secondPlayer);
        if (command.type === 'rangedAttack') {
          return getExpectedRangedResolveStart(state, secondPlayer);
        }
        return getExpectedMovementResolveStart(state, secondPlayer);
      }

      if (
        getCardInPlay(state.cardState, secondPlayer).command.type ===
        'rangedAttack'
      ) {
        return {
          actionType: 'gameEffect',
          effectType: 'completeRangedAttackCommand',
        };
      }

      if (
        getCardInPlay(state.cardState, secondPlayer).command.type === 'movement'
      ) {
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
