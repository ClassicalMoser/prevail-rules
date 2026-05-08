import type { Phase } from "@game";
import { createEmptyGameState } from "@testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getExpectedEvent } from "./getExpectedEvent";

const {
  getCurrentPhaseStateMock,
  getExpectedCleanupPhaseEventMock,
  getExpectedIssueCommandsPhaseEventMock,
  getExpectedMoveCommandersPhaseEventMock,
  getExpectedPlayCardsPhaseEventMock,
  getExpectedResolveMeleePhaseEventMock,
} = vi.hoisted(() => ({
  getCurrentPhaseStateMock: vi.fn(),
  getExpectedCleanupPhaseEventMock: vi.fn(),
  getExpectedIssueCommandsPhaseEventMock: vi.fn(),
  getExpectedMoveCommandersPhaseEventMock: vi.fn(),
  getExpectedPlayCardsPhaseEventMock: vi.fn(),
  getExpectedResolveMeleePhaseEventMock: vi.fn(),
}));

vi.mock("@queries/sequencing", () => ({
  getCurrentPhaseState: getCurrentPhaseStateMock,
}));

vi.mock("./byPhase", () => ({
  getExpectedCleanupPhaseEvent: getExpectedCleanupPhaseEventMock,
  getExpectedIssueCommandsPhaseEvent: getExpectedIssueCommandsPhaseEventMock,
  getExpectedMoveCommandersPhaseEvent: getExpectedMoveCommandersPhaseEventMock,
  getExpectedPlayCardsPhaseEvent: getExpectedPlayCardsPhaseEventMock,
  getExpectedResolveMeleePhaseEvent: getExpectedResolveMeleePhaseEventMock,
}));

/**
 * getExpectedEvent: top-level router to the next expected event from full game state.
 */
describe("getExpectedEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function expectDelegation(
    phase: Phase,
    delegatedMock: ReturnType<typeof vi.fn>,
    delegateReturn: { actionType: "gameEffect"; effectType: string },
  ) {
    const state = createEmptyGameState();
    getCurrentPhaseStateMock.mockReturnValue({ phase });
    delegatedMock.mockReturnValue(delegateReturn);

    const result = getExpectedEvent(state);

    expect(result).toEqual({ ...delegateReturn, expectedEventNumber: 0 });
    expect(getCurrentPhaseStateMock).toHaveBeenCalledWith(state);
    expect(delegatedMock).toHaveBeenCalledWith(state);
  }

  it("given delegate playCards to the play cards phase handler", () => {
    expectDelegation("playCards", getExpectedPlayCardsPhaseEventMock, {
      actionType: "gameEffect",
      effectType: "playCardsEvent",
    });
  });

  it("given delegate moveCommanders to the move commanders phase handler", () => {
    expectDelegation("moveCommanders", getExpectedMoveCommandersPhaseEventMock, {
      actionType: "gameEffect",
      effectType: "moveCommandersEvent",
    });
  });

  it("given delegate issueCommands to the issue commands phase handler", () => {
    expectDelegation("issueCommands", getExpectedIssueCommandsPhaseEventMock, {
      actionType: "gameEffect",
      effectType: "issueCommandsEvent",
    });
  });

  it("given delegate resolveMelee to the resolve melee phase handler", () => {
    expectDelegation("resolveMelee", getExpectedResolveMeleePhaseEventMock, {
      actionType: "gameEffect",
      effectType: "resolveMeleeEvent",
    });
  });

  it("given delegate cleanup to the cleanup phase handler", () => {
    expectDelegation("cleanup", getExpectedCleanupPhaseEventMock, {
      actionType: "gameEffect",
      effectType: "cleanupEvent",
    });
  });

  it("given for an invalid phase, throws", () => {
    const state = createEmptyGameState();
    getCurrentPhaseStateMock.mockReturnValue({ phase: "invalidPhase" });

    expect(() => getExpectedEvent(state)).toThrow("Invalid phase");
  });
});
