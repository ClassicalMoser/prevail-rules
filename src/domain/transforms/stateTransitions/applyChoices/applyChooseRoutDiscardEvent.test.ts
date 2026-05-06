import type { ChooseRoutDiscardEvent } from "@events";
import { getCurrentRallyResolutionState } from "@queries";
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from "@testing";
import { updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";
import { applyChooseRoutDiscardEvent } from "./applyChooseRoutDiscardEvent";

/**
 * During cleanup `resolveRally`, a rout substep may require the player to commit which cards
 * to discard; this marks `routState.cardsChosen` without leaving the resolve-rally step.
 */
describe("applyChooseRoutDiscardEvent", () => {
  /** Cleanup on first or second resolveRally with embedded routState for the acting player. */
  function createStateInResolveRallyWithRout(
    step: "firstPlayerResolveRally" | "secondPlayerResolveRally",
    player: "white" | "black",
  ) {
    const state = createEmptyGameState({ currentInitiative: "white" });
    const unit = createTestUnit(player, { attack: 2 });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState(player, unit),
    });
    const phaseState = createCleanupPhaseState({
      step,
      firstPlayerRallyResolutionState: step === "firstPlayerResolveRally" ? rallyState : undefined,
      secondPlayerRallyResolutionState:
        step === "secondPlayerResolveRally" ? rallyState : undefined,
    });
    return updatePhaseState(state, phaseState);
  }

  it("given firstPlayerResolveRally rout for white, empty cardIds sets cardsChosen and same step", () => {
    const state = createStateInResolveRallyWithRout("firstPlayerResolveRally", "white");
    const event: ChooseRoutDiscardEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseRoutDiscard",
      player: "white",
      cardIds: [],
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = newState.currentRoundState.currentPhaseState;
    const rallyState = getCurrentRallyResolutionState(newState);

    expect(phase?.phase).toBe("cleanup");
    expect(phase?.step).toBe("firstPlayerResolveRally");
    expect(rallyState.routState?.cardsChosen).toBe(true);
  });

  it("given secondPlayerResolveRally rout for black, empty cardIds sets cardsChosen and same step", () => {
    const state = createStateInResolveRallyWithRout("secondPlayerResolveRally", "black");
    const event: ChooseRoutDiscardEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseRoutDiscard",
      player: "black",
      cardIds: [],
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = newState.currentRoundState.currentPhaseState;
    const rallyState = getCurrentRallyResolutionState(newState);

    expect(phase?.phase).toBe("cleanup");
    expect(phase?.step).toBe("secondPlayerResolveRally");
    expect(rallyState.routState?.cardsChosen).toBe(true);
  });

  it("given playCards phase, throws expected cleanup phase", () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(state, createPlayCardsPhaseState());
    const event: ChooseRoutDiscardEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseRoutDiscard",
      player: "white",
      cardIds: [],
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInPlayCards)).toThrow(
      "Expected cleanup phase",
    );
  });

  it("given cleanup discardPlayedCards, throws not in resolveRally step", () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: "discardPlayedCards",
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const event: ChooseRoutDiscardEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseRoutDiscard",
      player: "white",
      cardIds: [],
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInCleanup)).toThrow(
      "Not in a resolveRally step",
    );
  });
});
