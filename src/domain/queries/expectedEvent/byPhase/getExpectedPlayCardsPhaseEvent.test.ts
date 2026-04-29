import type { StandardGameState } from "@game";
import { expectedGameEffectSchema, expectedPlayerInputSchema } from "@events";

import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from "@game";
import { tempCommandCards } from "@sampleValues";
import { createEmptyGameState } from "@testing";
import { updateCardState, updatePhaseState } from "@transforms";
import { describe, expect, it } from "vitest";
import { getExpectedPlayCardsPhaseEvent } from "./getExpectedPlayCardsPhaseEvent";

/**
 * getExpectedPlayCardsPhaseEvent: next event during play-cards phase from phase state.
 */
describe("getExpectedPlayCardsPhaseEvent", () => {
  /**
   * Helper to create a game state in the playCards phase with a specific step
   */
  function createGameStateInPlayCardsStep(
    step: "chooseCards" | "revealCards" | "assignInitiative" | "complete",
  ): StandardGameState {
    const state = createEmptyGameState();

    const stateWithPhase = updatePhaseState(state, {
      phase: PLAY_CARDS_PHASE,
      step,
    });

    return stateWithPhase;
  }

  describe("expected events by step", () => {
    describe("chooseCards step", () => {
      it("given no cards have been chosen, returns bothPlayers", () => {
        const state = createGameStateInPlayCardsStep("chooseCards");
        // Ensure no cards are awaiting play
        const stateWithNoAwaitingCards = updateCardState(state, (current) => ({
          ...current,
          black: { ...current.black, awaitingPlay: null },
          white: { ...current.white, awaitingPlay: null },
        }));

        const expectedEvent = getExpectedPlayCardsPhaseEvent(stateWithNoAwaitingCards);

        expect(expectedEvent.actionType).toBe("playerChoice");
        const resultIsExpectedPlayerInput = expectedPlayerInputSchema.safeParse(expectedEvent);
        expect(resultIsExpectedPlayerInput.success).toBe(true);
        expect(resultIsExpectedPlayerInput.data?.playerSource).toBe("bothPlayers");
        expect(resultIsExpectedPlayerInput.data?.choiceType).toBe("chooseCard");
      });

      it("given black has already chosen, returns white player", () => {
        const state = createGameStateInPlayCardsStep("chooseCards");
        const stateWithBlackCard = updateCardState(state, (current) => ({
          ...current,
          black: { ...current.black, awaitingPlay: tempCommandCards[0] },
        }));

        const expectedEvent = getExpectedPlayCardsPhaseEvent(stateWithBlackCard);

        expect(expectedEvent.actionType).toBe("playerChoice");
        const resultIsExpectedPlayerInput = expectedPlayerInputSchema.safeParse(expectedEvent);
        expect(resultIsExpectedPlayerInput.success).toBe(true);
        expect(resultIsExpectedPlayerInput.data?.playerSource).toBe("white");
        expect(resultIsExpectedPlayerInput.data?.choiceType).toBe("chooseCard");
      });

      it("given white has already chosen, returns black player", () => {
        const state = createGameStateInPlayCardsStep("chooseCards");
        // Ensure black has no awaiting card
        const stateWithWhiteCard = updateCardState(state, (current) => ({
          ...current,
          black: { ...current.black, awaitingPlay: null },
          white: { ...current.white, awaitingPlay: tempCommandCards[0] },
        }));

        const expectedEvent = getExpectedPlayCardsPhaseEvent(stateWithWhiteCard);

        expect(expectedEvent.actionType).toBe("playerChoice");
        const resultIsExpectedPlayerInput = expectedPlayerInputSchema.safeParse(expectedEvent);
        expect(resultIsExpectedPlayerInput.success).toBe(true);
        expect(resultIsExpectedPlayerInput.data?.playerSource).toBe("black");
        expect(resultIsExpectedPlayerInput.data?.choiceType).toBe("chooseCard");
      });
    });

    it("given step is revealCards, returns revealCards gameEffect", () => {
      const state = createGameStateInPlayCardsStep("revealCards");

      const expectedEvent = getExpectedPlayCardsPhaseEvent(state);

      expect(expectedEvent.actionType).toBe("gameEffect");
      const resultIsExpectedGameEffect = expectedGameEffectSchema.safeParse(expectedEvent);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe("revealCards");
    });

    it("given step is assignInitiative, returns resolveInitiative gameEffect", () => {
      const state = createGameStateInPlayCardsStep("assignInitiative");

      const expectedEvent = getExpectedPlayCardsPhaseEvent(state);

      expect(expectedEvent.actionType).toBe("gameEffect");
      const resultIsExpectedGameEffect = expectedGameEffectSchema.safeParse(expectedEvent);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe("resolveInitiative");
    });

    it("given step is complete, returns completePlayCardsPhase gameEffect", () => {
      const state = createGameStateInPlayCardsStep("complete");

      const expectedEvent = getExpectedPlayCardsPhaseEvent(state);

      expect(expectedEvent.actionType).toBe("gameEffect");
      const resultIsExpectedGameEffect = expectedGameEffectSchema.safeParse(expectedEvent);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe("completePlayCardsPhase");
    });
  });

  describe("error cases", () => {
    it("given if not in playCards phase, throws", () => {
      const state = createEmptyGameState();
      // State has no phase state

      expect(() => getExpectedPlayCardsPhaseEvent(state)).toThrow("No current phase state found");
    });

    it("given if in wrong phase, throws", () => {
      const state = createEmptyGameState();
      const stateWithWrongPhase = updatePhaseState(state, {
        phase: MOVE_COMMANDERS_PHASE,
        step: "moveFirstCommander",
      });

      expect(() => getExpectedPlayCardsPhaseEvent(stateWithWrongPhase)).toThrow(
        "Expected playCards phase",
      );
    });

    it("given for invalid step, throws", () => {
      const state = createGameStateInPlayCardsStep("chooseCards");
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

      expect(() => getExpectedPlayCardsPhaseEvent(stateWithInvalidStep)).toThrow(
        "Invalid playCards phase step: invalidStep",
      );
    });
  });
});
