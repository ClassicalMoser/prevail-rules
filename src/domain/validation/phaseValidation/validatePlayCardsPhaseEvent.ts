import type { Board, ValidationResult } from "@entities";
import type { EventForBoard, PlayerChoiceEvent } from "@events";
import type { GameState, GameStateForBoard, PlayCardsPhaseState } from "@game";
import { validatePlayerChoice } from "@validation/playerChoice";

/**
 * @deprecated Validation under rework.
 */
export function validatePlayCardsPhaseEvent<TBoard extends Board>(
  event: EventForBoard<TBoard>,
  state: GameStateForBoard<TBoard> & {
    currentRoundState: {
      currentPhaseState: PlayCardsPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case "chooseCards":
      if (event.eventType === "playerChoice") {
        return validatePlayerChoice(event as PlayerChoiceEvent, state as GameState);
      }
      return {
        result: false,
        errorReason: "Expected ChooseCardEvent",
      };

    case "revealCards":
      if (event.eventType === "gameEffect" && event.effectType === "revealCards") {
        return { result: true };
      }
      return {
        result: false,
        errorReason: "Expected RevealCardsEvent",
      };

    case "assignInitiative":
      if (event.eventType === "gameEffect" && event.effectType === "resolveInitiative") {
        return { result: true };
      }
      return {
        result: false,
        errorReason: "Expected ResolveInitiativeEvent",
      };

    case "complete":
      if (event.eventType === "gameEffect" && event.effectType === "completePlayCardsPhase") {
        return { result: true };
      }
      return {
        result: false,
        errorReason: "Expected CompletePlayCardsPhaseEvent",
      };

    default:
      return {
        result: false,
        errorReason: `Invalid playCards phase step: ${phaseState.step}`,
      };
  }
}
