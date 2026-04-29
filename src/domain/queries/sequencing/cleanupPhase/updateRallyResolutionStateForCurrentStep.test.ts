import type { RallyResolutionState } from "@game";
import { CLEANUP_PHASE } from "@game";
import { describe, expect, it } from "vitest";
import { updateRallyResolutionStateForCurrentStep } from "./updateRallyResolutionStateForCurrentStep";

/**
 * Immutable cleanup phase update: writes the new rally slice for the active resolve-rally step
 * and advances `step` in the same object shape.
 */
describe("updateRallyResolutionStateForCurrentStep", () => {
  it("given firstPlayerResolveRally, replaces first bucket and sets next step secondPlayerChooseRally", () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: "firstPlayerResolveRally" as const,
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    };

    const updatedRallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
    };

    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      phaseState,
      updatedRallyState,
      "secondPlayerChooseRally",
    );

    expect(newPhaseState.firstPlayerRallyResolutionState).toEqual(updatedRallyState);
    expect(newPhaseState.step).toBe("secondPlayerChooseRally");
  });

  it("given secondPlayerResolveRally, replaces second bucket and step complete", () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: "secondPlayerResolveRally" as const,
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
    };

    const updatedRallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
    };

    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      phaseState,
      updatedRallyState,
      "complete",
    );

    expect(newPhaseState.secondPlayerRallyResolutionState).toEqual(updatedRallyState);
    expect(newPhaseState.step).toBe("complete");
  });

  it("given discardPlayedCards step, throws not on resolveRally step", () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: "discardPlayedCards" as const,
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    const updatedRallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
    };

    expect(() =>
      updateRallyResolutionStateForCurrentStep(phaseState, updatedRallyState, "complete"),
    ).toThrow("Cleanup phase is not on a resolveRally step");
  });
});
