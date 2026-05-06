import type { GameStateForBoard } from "@game";
import type { StandardBoard } from "@entities";

import { MOVE_COMMANDERS_PHASE } from "@game";
import { createEmptyGameState } from "@testing";
import { updatePhaseState } from "@transforms";
import { describe, expect, it } from "vitest";
import { getExpectedMoveCommandersPhaseEvent } from "./getExpectedMoveCommandersPhaseEvent";
import { ExpectedGameEffect, ExpectedPlayerInput } from "@events";

/**
 * getExpectedMoveCommandersPhaseEvent: next event during move-commanders phase.
 */
describe("getExpectedMoveCommandersPhaseEvent", () => {
  /**
   * Helper to create a game state in the moveCommanders phase with a specific step
   */
  function createGameStateInMoveCommandersStep(
    step: "moveFirstCommander" | "moveSecondCommander" | "complete",
    currentInitiative: "black" | "white" = "black",
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });

    const stateWithPhase = updatePhaseState(state, {
      phase: MOVE_COMMANDERS_PHASE,
      step,
    });

    return stateWithPhase;
  }

  describe("expected events by step", () => {
    it("given step is moveFirstCommander, returns firstPlayer moveCommander", () => {
      const state = createGameStateInMoveCommandersStep("moveFirstCommander", "black");

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe("playerChoice");
    });

    it("given step is moveSecondCommander, returns secondPlayer moveCommander", () => {
      const state = createGameStateInMoveCommandersStep("moveSecondCommander", "black");

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe("playerChoice");
    });

    it("given step is complete, returns completeMoveCommandersPhase gameEffect", () => {
      const state = createGameStateInMoveCommandersStep("complete");

      const expectedEvent = getExpectedMoveCommandersPhaseEvent(state);

      expect(expectedEvent.actionType).toBe("gameEffect");
      expect((expectedEvent as ExpectedGameEffect).effectType).toBe("completeMoveCommandersPhase");
    });

    it("given correctly identify first and second player based on initiative", () => {
      // Test with white as initiative
      const stateWithWhiteInitiative = createGameStateInMoveCommandersStep(
        "moveFirstCommander",
        "white",
      );

      const expectedEventWhite = getExpectedMoveCommandersPhaseEvent(stateWithWhiteInitiative);

      expect(expectedEventWhite.actionType).toBe("playerChoice");
      expect((expectedEventWhite as ExpectedPlayerInput).playerSource).toBe("white");
      expect((expectedEventWhite as ExpectedPlayerInput).choiceType).toBe("moveCommander");

      // Test with black as initiative
      const stateWithBlackInitiative = createGameStateInMoveCommandersStep(
        "moveFirstCommander",
        "black",
      );

      const expectedEventBlack = getExpectedMoveCommandersPhaseEvent(stateWithBlackInitiative);

      expect(expectedEventBlack.actionType).toBe("playerChoice");
      expect((expectedEventBlack as ExpectedPlayerInput).playerSource).toBe("black");
      expect((expectedEventBlack as ExpectedPlayerInput).choiceType).toBe("moveCommander");
    });
  });

  describe("error cases", () => {
    it("given for invalid step, throws", () => {
      const state = createGameStateInMoveCommandersStep("moveFirstCommander");
      // Bad type cast to test default case
      const stateWithInvalidStep = {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: {
            ...state.currentRoundState.currentPhaseState!,
            step: "invalidStep" as any,
          },
        },
      };

      expect(() => getExpectedMoveCommandersPhaseEvent(stateWithInvalidStep)).toThrow(
        "Invalid moveCommanders phase step: invalidStep",
      );
    });
  });
});
