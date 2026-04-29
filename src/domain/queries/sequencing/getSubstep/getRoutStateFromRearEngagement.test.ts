import type { RearEngagementResolutionState } from "@game";
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestCard,
  createTestUnit,
} from "@testing";
import { updatePhaseState } from "@transforms";
import { describe, expect, it } from "vitest";

import { getRoutStateFromRearEngagement } from "./getRoutStateFromRearEngagement";

/**
 * Rear-contact movement: the nested rear engagement must carry a rout substep; this unwraps it
 * from issueCommands + movement CRS with validation.
 */
describe("getRoutStateFromRearEngagement", () => {
  it("given rear engagement movement with routState, returns same rout object", () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const whiteUnit = createTestUnit("white");
    const routState = createRoutState("white", whiteUnit, {
      numberToDiscard: 2,
    });
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({ routState }),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(getRoutStateFromRearEngagement(full)).toBe(routState);
  });

  it("given movement without engagementState, throws movement has no engagement", () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const movement = createMovementResolutionState(state, {
      engagementState: undefined,
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow(
      "Movement resolution has no engagement state",
    );
  });

  it("throws when engagement is not rear", () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const movement = createMovementResolutionState(state, {
      engagementState: createFrontEngagementState(),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow(
      "Expected rear engagement for movement rout, got front",
    );
  });

  it("given rear engagement shape without routState, throws rear has no rout", () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const rearBroken = {
      ...createRearEngagementState(),
      engagementResolutionState: {
        engagementType: "rear" as const,
        completed: false,
      } as unknown as RearEngagementResolutionState,
    };
    const movement = createMovementResolutionState(state, {
      engagementState: rearBroken,
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow("Rear engagement has no rout state");
  });
});
