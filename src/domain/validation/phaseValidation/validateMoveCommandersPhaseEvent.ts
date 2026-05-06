import type { Board, ValidationResult } from "@entities";
import type { EventForBoard, PlayerChoiceEvent } from "@events";
import type { GameState, GameStateForBoard, MoveCommandersPhaseState } from "@game";
import { validatePlayerChoice } from "@validation/playerChoice";

/**
 * @deprecated Validation under rework.
 */
export function validateMoveCommandersPhaseEvent<TBoard extends Board>(
  event: EventForBoard<TBoard>,
  state: GameStateForBoard<TBoard> & {
    currentRoundState: {
      currentPhaseState: MoveCommandersPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case "moveFirstCommander":
    case "moveSecondCommander":
      if (event.eventType === "playerChoice") {
        return validatePlayerChoice(event as PlayerChoiceEvent, state as GameState);
      }
      return {
        result: false,
        errorReason: "Expected MoveCommanderEvent",
      };

    case "complete":
      if (event.eventType === "gameEffect" && event.effectType === "completeMoveCommandersPhase") {
        return { result: true };
      }
      return {
        result: false,
        errorReason: "Expected CompleteMoveCommandersPhaseEvent",
      };

    default:
      return {
        result: false,
        errorReason: `Invalid moveCommanders phase step: ${phaseState.step}`,
      };
  }
}
