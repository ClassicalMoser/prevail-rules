import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getExpectedCommandResolutionSubstepEvent } from './getExpectedCommandResolutionEvent';
import { getExpectedStartCommandResolutionEvent } from './getExpectedNextUnitResolutionEvent';

/**
 * Gets information about the expected event for the Issue Commands phase.
 *
 * @param state - The current game state with Issue Commands phase
 * @returns Information about what event is expected
 */
export function getExpectedIssueCommandsPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase !== 'issueCommands') {
    throw new Error('Current phase is not issueCommands');
  }

  switch (phaseState.step) {
    case 'firstPlayerIssueCommands':
      // If there are remaining commands, expect issueCommand
      if (phaseState.remainingCommandsFirstPlayer.size > 0) {
        return {
          actionType: 'playerChoice',
          playerSource: firstPlayer,
          choiceType: 'issueCommand',
        };
      }
      // All commands issued - should have advanced to firstPlayerResolveCommands
      // This state should not occur if applyIssueCommandEvent properly advances steps
      throw new Error(
        'All first player commands issued but step not advanced to firstPlayerResolveCommands',
      );

    case 'firstPlayerResolveCommands': {
      // Check if there's an ongoing command resolution
      if (phaseState.currentCommandResolutionState) {
        return getExpectedCommandResolutionSubstepEvent(
          state,
          phaseState.currentCommandResolutionState,
          firstPlayer,
        );
      }

      // No ongoing resolution - check if there are remaining units to resolve
      if (phaseState.remainingUnitsFirstPlayer.size > 0) {
        return getExpectedStartCommandResolutionEvent(state, firstPlayer);
      }
      // All units resolved - should have advanced to secondPlayerIssueCommands
      throw new Error(
        'All first player units resolved but step not advanced to secondPlayerIssueCommands',
      );
    }

    case 'secondPlayerIssueCommands':
      // If there are remaining commands, expect issueCommand
      if (phaseState.remainingCommandsSecondPlayer.size > 0) {
        return {
          actionType: 'playerChoice',
          playerSource: secondPlayer,
          choiceType: 'issueCommand',
        };
      }
      // All commands issued - should have advanced to secondPlayerResolveCommands
      throw new Error(
        'All second player commands issued but step not advanced to secondPlayerResolveCommands',
      );

    case 'secondPlayerResolveCommands': {
      // Check if there's an ongoing command resolution
      if (phaseState.currentCommandResolutionState) {
        return getExpectedCommandResolutionSubstepEvent(
          state,
          phaseState.currentCommandResolutionState,
          secondPlayer,
        );
      }

      // No ongoing resolution - check if there are remaining units to resolve
      if (phaseState.remainingUnitsSecondPlayer.size > 0) {
        return getExpectedStartCommandResolutionEvent(state, secondPlayer);
      }
      // All units resolved - should have advanced to complete
      throw new Error(
        'All second player units resolved but step not advanced to complete',
      );
    }

    case 'complete':
      return {
        actionType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
      };

    default: {
      const _exhaustive: never = phaseState;
      throw new Error(`Invalid issueCommands phase state: ${_exhaustive}`);
    }
  }
}
