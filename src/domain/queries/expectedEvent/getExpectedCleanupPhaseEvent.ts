import type {
  Board,
  CleanupPhaseState,
  ExpectedEventInfo,
  GameState,
  RoundState,
} from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';

/**
 * Gets information about the expected event for the Cleanup phase.
 *
 * @param state - The current game state with Cleanup phase
 * @returns Information about what event is expected
 */
export function getExpectedCleanupPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard> & {
    currentRoundState: RoundState & { currentPhaseState: CleanupPhaseState };
  },
): ExpectedEventInfo {
  const phaseState = state.currentRoundState.currentPhaseState;
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

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

      // Check for rout discard penalty
      if (rallyState.routDiscardState) {
        if (!rallyState.routDiscardState.cardsChosen) {
          return {
            actionType: 'playerChoice',
            playerSource: firstPlayer,
            choiceType: 'chooseRoutDiscard',
          };
        } else {
          return {
            actionType: 'gameEffect',
            effectType: 'resolveRoutDiscard',
          };
        }
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

      // Check for rout discard penalty
      if (rallyState.routDiscardState) {
        if (!rallyState.routDiscardState.cardsChosen) {
          return {
            actionType: 'playerChoice',
            playerSource: secondPlayer,
            choiceType: 'chooseRoutDiscard',
          };
        } else {
          return {
            actionType: 'gameEffect',
            effectType: 'resolveRoutDiscard',
          };
        }
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
