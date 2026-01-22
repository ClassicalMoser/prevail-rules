import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';

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
        const resolutionState = phaseState.currentCommandResolutionState;

        // Handle movement resolution substeps
        if (resolutionState.commandResolutionType === 'movement') {
          // Check commitment state
          if (resolutionState.commitment.commitmentType === 'pending') {
            return {
              actionType: 'playerChoice',
              playerSource: firstPlayer,
              choiceType: 'commitToMovement',
            };
          }
          // Commitment resolved (declined or completed), expect moveUnit
          return {
            actionType: 'playerChoice',
            playerSource: firstPlayer,
            choiceType: 'moveUnit',
          };
        }

        // Handle ranged attack resolution substeps
        if (resolutionState.commandResolutionType === 'rangedAttack') {
          // Check attacking player's commitment
          if (resolutionState.attackingCommitment.commitmentType === 'pending') {
            return {
              actionType: 'playerChoice',
              playerSource: firstPlayer,
              choiceType: 'commitToRangedAttack',
            };
          }
          // Check defending player's commitment
          if (resolutionState.defendingCommitment.commitmentType === 'pending') {
            return {
              actionType: 'playerChoice',
              playerSource: secondPlayer,
              choiceType: 'commitToRangedAttack',
            };
          }
          // Both commitments resolved, check if performRangedAttack has been done
          // If attackApplyState exists, we're in the apply phase
          if (resolutionState.attackApplyState.substepType === 'attackApplyPending') {
            return {
              actionType: 'gameEffect',
              effectType: 'resolveRangedAttack',
            };
          }
          // Attack apply in progress - check what needs to be resolved
          if (resolutionState.attackApplyState.substepType === 'attackApplyInProgress') {
            const applyState = resolutionState.attackApplyState;
            // TODO: Check which attack results need to be resolved (rout, retreat, reverse)
            // For now, if all are resolved, the command resolution should be complete
            if (
              applyState.routResolved &&
              applyState.retreatResolved &&
              applyState.reverseResolved
            ) {
              // Command resolution complete, should have been removed from remainingUnits
              throw new Error(
                'Ranged attack resolution complete but unit not removed from remainingUnits',
              );
            }
            // Some attack results still need resolution
            // TODO: Return appropriate resolve events (resolveRout, resolveRetreat, resolveReverse)
            throw new Error('Attack apply in progress - resolve events not yet implemented');
          }
          // Commitments resolved but performRangedAttack not yet done
          return {
            actionType: 'playerChoice',
            playerSource: firstPlayer,
            choiceType: 'performRangedAttack',
          };
        }
      }

      // No ongoing resolution - check if there are remaining units to resolve
      if (phaseState.remainingUnitsFirstPlayer.size > 0) {
        const activeCard = state.cardState[firstPlayer].inPlay;
        if (!activeCard) {
          throw new Error('First player has no active card');
        }
        // Command type determines what action is expected to start resolution
        if (activeCard.command.type === 'movement') {
          return {
            actionType: 'playerChoice',
            playerSource: firstPlayer,
            choiceType: 'moveUnit',
          };
        } else if (activeCard.command.type === 'rangedAttack') {
          return {
            actionType: 'playerChoice',
            playerSource: firstPlayer,
            choiceType: 'performRangedAttack',
          };
        } else {
          throw new Error(
            `Invalid command type: ${activeCard.command.type as string}`,
          );
        }
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
        const resolutionState = phaseState.currentCommandResolutionState;

        // Handle movement resolution substeps
        if (resolutionState.commandResolutionType === 'movement') {
          // Check commitment state
          if (resolutionState.commitment.commitmentType === 'pending') {
            return {
              actionType: 'playerChoice',
              playerSource: secondPlayer,
              choiceType: 'commitToMovement',
            };
          }
          // Commitment resolved (declined or completed), expect moveUnit
          return {
            actionType: 'playerChoice',
            playerSource: secondPlayer,
            choiceType: 'moveUnit',
          };
        }

        // Handle ranged attack resolution substeps
        if (resolutionState.commandResolutionType === 'rangedAttack') {
          // Check attacking player's commitment
          if (resolutionState.attackingCommitment.commitmentType === 'pending') {
            return {
              actionType: 'playerChoice',
              playerSource: secondPlayer,
              choiceType: 'commitToRangedAttack',
            };
          }
          // Check defending player's commitment
          if (resolutionState.defendingCommitment.commitmentType === 'pending') {
            return {
              actionType: 'playerChoice',
              playerSource: firstPlayer,
              choiceType: 'commitToRangedAttack',
            };
          }
          // Both commitments resolved, check if performRangedAttack has been done
          // If attackApplyState exists, we're in the apply phase
          if (resolutionState.attackApplyState.substepType === 'attackApplyPending') {
            return {
              actionType: 'gameEffect',
              effectType: 'resolveRangedAttack',
            };
          }
          // Attack apply in progress - check what needs to be resolved
          if (resolutionState.attackApplyState.substepType === 'attackApplyInProgress') {
            const applyState = resolutionState.attackApplyState;
            // TODO: Check which attack results need to be resolved (rout, retreat, reverse)
            // For now, if all are resolved, the command resolution should be complete
            if (
              applyState.routResolved &&
              applyState.retreatResolved &&
              applyState.reverseResolved
            ) {
              // Command resolution complete, should have been removed from remainingUnits
              throw new Error(
                'Ranged attack resolution complete but unit not removed from remainingUnits',
              );
            }
            // Some attack results still need resolution
            // TODO: Return appropriate resolve events (resolveRout, resolveRetreat, resolveReverse)
            throw new Error('Attack apply in progress - resolve events not yet implemented');
          }
          // Commitments resolved but performRangedAttack not yet done
          return {
            actionType: 'playerChoice',
            playerSource: secondPlayer,
            choiceType: 'performRangedAttack',
          };
        }
      }

      // No ongoing resolution - check if there are remaining units to resolve
      if (phaseState.remainingUnitsSecondPlayer.size > 0) {
        const activeCard = state.cardState[secondPlayer].inPlay;
        if (!activeCard) {
          throw new Error('Second player has no active card');
        }
        // Command type determines what action is expected to start resolution
        if (activeCard.command.type === 'movement') {
          return {
            actionType: 'playerChoice',
            playerSource: secondPlayer,
            choiceType: 'moveUnit',
          };
        } else if (activeCard.command.type === 'rangedAttack') {
          return {
            actionType: 'playerChoice',
            playerSource: secondPlayer,
            choiceType: 'performRangedAttack',
          };
        } else {
          throw new Error(
            `Invalid command type: ${activeCard.command.type as string}`,
          );
        }
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
