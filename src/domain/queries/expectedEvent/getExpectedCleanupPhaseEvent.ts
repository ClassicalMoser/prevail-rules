import type { Board, ExpectedEventInfo, GameState } from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getExpectedRoutDiscardEvent } from './getExpectedRoutDiscardEvent';

/**
 * Gets information about the expected event for the Cleanup phase.
 *
 * @param state - The current game state with Cleanup phase
 * @returns Information about what event is expected
 */
export function getExpectedCleanupPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  switch (phaseState.step) {
    case 'discardPlayedCards':
      return {
        actionType: 'gameEffect',
        effectType: 'discardPlayedCards',
      };

    case 'firstPlayerChooseRally':
      return {
        actionType: 'playerChoice',
        playerSource: firstPlayer,
        choiceType: 'chooseRally',
      };

    case 'secondPlayerChooseRally':
      return {
        actionType: 'playerChoice',
        playerSource: secondPlayer,
        choiceType: 'chooseRally',
      };

    case 'firstPlayerResolveRally': {
      const rallyState = phaseState.firstPlayerRallyResolutionState;

      if (!rallyState) {
        throw new Error('First player rally resolution state not found');
      }

      // Check substep progression
      if (!rallyState.rallyResolved) {
        return {
          actionType: 'gameEffect',
          effectType: 'resolveRally',
        };
      }

      if (rallyState.unitsLostSupport === undefined) {
        return {
          actionType: 'gameEffect',
          effectType: 'resolveUnitsBroken',
        };
      }

      if (rallyState.unitsLostSupport.size > 0) {
        if (rallyState.routDiscardState === undefined) {
          throw new Error(
            'Rout discard state is required when units lost support',
          );
        }
        return getExpectedRoutDiscardEvent(rallyState.routDiscardState);
      }

      // Rally fully resolved, should have advanced to next step
      throw new Error('Rally resolution complete but step not advanced');
    }

    case 'secondPlayerResolveRally': {
      const rallyState = phaseState.secondPlayerRallyResolutionState;

      if (!rallyState) {
        throw new Error('Second player rally resolution state not found');
      }

      // Check substep progression
      if (!rallyState.rallyResolved) {
        return {
          actionType: 'gameEffect',
          effectType: 'resolveRally',
        };
      }

      if (rallyState.unitsLostSupport === undefined) {
        return {
          actionType: 'gameEffect',
          effectType: 'resolveUnitsBroken',
        };
      }

      if (rallyState.unitsLostSupport.size > 0) {
        if (rallyState.routDiscardState === undefined) {
          throw new Error(
            'Rout discard state is required when units lost support',
          );
        }
        return getExpectedRoutDiscardEvent(rallyState.routDiscardState);
      }

      // Rally fully resolved, should have advanced to next step
      throw new Error('Rally resolution complete but step not advanced');
    }

    case 'complete':
      return {
        actionType: 'gameEffect',
        effectType: 'completeCleanupPhase',
      };

    default:
      throw new Error(`Invalid cleanup phase step: ${phaseState.step}`);
  }
}
