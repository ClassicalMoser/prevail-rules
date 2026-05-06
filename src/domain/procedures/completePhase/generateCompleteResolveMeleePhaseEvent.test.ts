import type { GameStateForBoard } from "@game";
import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";

import { generateCompleteResolveMeleePhaseEvent } from "./generateCompleteResolveMeleePhaseEvent";
import { StandardBoard } from "@entities";

/**
 * Closes the resolve-melee phase after all engagements are processed. Generator returns
 * only the `completeResolveMeleePhase` effect marker; no per-state branching in procedure.
 */
describe("generateCompleteResolveMeleePhaseEvent", () => {
  it("given any game state, emits gameEffect with effectType completeResolveMeleePhase", () => {
    const state: GameStateForBoard<StandardBoard> = createEmptyGameState();
    const event = generateCompleteResolveMeleePhaseEvent(state, 0);
    expect(event.eventType).toBe("gameEffect");
    expect(event.effectType).toBe("completeResolveMeleePhase");
  });

  it("given two separately constructed empty states, emits deeply equal events (state-independent)", () => {
    const a = generateCompleteResolveMeleePhaseEvent(createEmptyGameState(), 0);
    const b = generateCompleteResolveMeleePhaseEvent(createEmptyGameState(), 0);
    expect(a).toEqual(b);
  });
});
