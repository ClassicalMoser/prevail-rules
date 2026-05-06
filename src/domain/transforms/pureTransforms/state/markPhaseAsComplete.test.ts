import type { CleanupPhaseState, PlayCardsPhaseState } from "@game";
import { CLEANUP_PHASE, PLAY_CARDS_PHASE } from "@game";
import { describe, expect, it } from "vitest";
import { markPhaseAsComplete } from "./markPhaseAsComplete";

/**
 * markPhaseAsComplete: Creates a new phase state with the step set to 'complete'.
 */
describe("markPhaseAsComplete", () => {
  it("given mark play cards phase as complete", () => {
    const phaseState: PlayCardsPhaseState = {
      phase: PLAY_CARDS_PHASE,
      step: "chooseCards",
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe("complete");
    expect(completedPhase.phase).toBe(PLAY_CARDS_PHASE);
    expect(completedPhase).not.toBe(phaseState);
  });

  it("given mark cleanup phase as complete", () => {
    const phaseState: CleanupPhaseState = {
      phase: CLEANUP_PHASE,
      step: "discardPlayedCards",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe("complete");
    expect(completedPhase.phase).toBe(CLEANUP_PHASE);
    expect(completedPhase.firstPlayerRallyResolutionState).toBe(
      phaseState.firstPlayerRallyResolutionState,
    );
    expect(completedPhase).not.toBe(phaseState);
  });

  it("given preserve all other phase state properties", () => {
    const phaseState: CleanupPhaseState = {
      phase: CLEANUP_PHASE,
      step: "firstPlayerResolveRally",
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe("complete");
    expect(completedPhase.firstPlayerRallyResolutionState).toBe(
      phaseState.firstPlayerRallyResolutionState,
    );
    expect(completedPhase.secondPlayerRallyResolutionState).toBe(
      phaseState.secondPlayerRallyResolutionState,
    );
  });
});
