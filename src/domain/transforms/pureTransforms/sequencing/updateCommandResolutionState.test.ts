import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from "@testing";
import { updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";
import { updateCommandResolutionState } from "./updateCommandResolutionState";

/**
 * updateCommandResolutionState: Creates a new game state with the command resolution state updated in the issue commands phase.
 */
describe("updateCommandResolutionState", () => {
  it("given update the command resolution state in issue commands phase", () => {
    const state = createEmptyGameState();
    const commandResolution = createMovementResolutionState(state);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: commandResolution,
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    const updatedResolution = createMovementResolutionState(state, {
      completed: true,
    });
    const newState = updateCommandResolutionState(stateInPhase, updatedResolution);

    expect(newState.currentRoundState.currentPhaseState?.phase).toBe("issueCommands");
    const newPhaseState = newState.currentRoundState.currentPhaseState;
    if (newPhaseState?.phase !== "issueCommands") throw new Error("phase");
    expect(newPhaseState.currentCommandResolutionState?.completed).toBe(true);
  });

  it("given not mutate the original state", () => {
    const state = createEmptyGameState();
    const commandResolution = createMovementResolutionState(state);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: commandResolution,
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const originalResolution =
      stateInPhase.currentRoundState.currentPhaseState?.phase === "issueCommands" &&
      stateInPhase.currentRoundState.currentPhaseState.currentCommandResolutionState;

    updateCommandResolutionState(stateInPhase, {
      ...commandResolution,
      completed: true,
    });

    expect(
      stateInPhase.currentRoundState.currentPhaseState?.phase === "issueCommands" &&
        stateInPhase.currentRoundState.currentPhaseState.currentCommandResolutionState,
    ).toBe(originalResolution);
  });

  it("given when no current command resolution state is set, throws", () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: undefined,
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const commandResolution = createMovementResolutionState(state);

    expect(() => updateCommandResolutionState(stateInPhase, commandResolution)).toThrow(
      "No current command resolution state found",
    );
  });
});
