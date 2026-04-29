import {
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
  RESOLVE_MELEE_PHASE,
} from "@game";
import { createEmptyGameState } from "@testing/createEmptyGameState";
import { describe, expect, it } from "vitest";
import {
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from "./phaseStates";

/**
 * createPlayCardsPhaseState: Creates a PlayCardsPhaseState with sensible defaults.
 */
describe("createPlayCardsPhaseState", () => {
  it("given context, returns play cards phase with default step", () => {
    const state = createPlayCardsPhaseState();
    expect(state.phase).toBe(PLAY_CARDS_PHASE);
    expect(state.step).toBe("chooseCards");
  });
});

describe("createMoveCommandersPhaseState", () => {
  it("given context, returns move commanders phase with default step", () => {
    const state = createMoveCommandersPhaseState();
    expect(state.phase).toBe(MOVE_COMMANDERS_PHASE);
    expect(state.step).toBe("moveFirstCommander");
  });
});

describe("createIssueCommandsPhaseState", () => {
  it("given context, returns issue commands phase with empty remaining sets", () => {
    const gameState = createEmptyGameState();
    const state = createIssueCommandsPhaseState(gameState);
    expect(state.phase).toBe(ISSUE_COMMANDS_PHASE);
    expect(state.step).toBe("firstPlayerResolveCommands");
    expect(state.remainingCommandsFirstPlayer.size).toBe(0);
    expect(state.currentCommandResolutionState).toBeUndefined();
  });
});

describe("createResolveMeleePhaseState", () => {
  it("given context, returns resolve melee phase with melee resolution state", () => {
    const gameState = createEmptyGameState();
    const state = createResolveMeleePhaseState(gameState);
    expect(state.phase).toBe(RESOLVE_MELEE_PHASE);
    expect(state.step).toBe("resolveMelee");
    expect(state.currentMeleeResolutionState).toBeDefined();
    expect(state.remainingEngagements.size).toBe(0);
  });
});

describe("createCleanupPhaseState", () => {
  it("given context, returns cleanup phase with default step", () => {
    const state = createCleanupPhaseState();
    expect(state.phase).toBe("cleanup");
    expect(state.step).toBe("discardPlayedCards");
    expect(state.firstPlayerRallyResolutionState).toBeUndefined();
  });
});
