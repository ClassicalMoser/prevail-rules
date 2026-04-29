import type { StandardGameState } from "@game";
import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";

import { generateCompleteMeleeResolutionEvent } from "./generateCompleteMeleeResolutionEvent";

/**
 * Marks one melee engagement resolution as finished so the phase can advance to the next
 * engagement or complete the resolve-melee phase. Emits only `completeMeleeResolution`;
 * no inputs from `state` in the procedure body.
 */
describe("generateCompleteMeleeResolutionEvent", () => {
  it("given any game state, emits gameEffect with effectType completeMeleeResolution", () => {
    const state: StandardGameState = createEmptyGameState();
    const event = generateCompleteMeleeResolutionEvent(state, 0);
    expect(event.eventType).toBe("gameEffect");
    expect(event.effectType).toBe("completeMeleeResolution");
  });

  it("given two separately constructed empty states, emits deeply equal events (state-independent)", () => {
    const a = generateCompleteMeleeResolutionEvent(createEmptyGameState(), 0);
    const b = generateCompleteMeleeResolutionEvent(createEmptyGameState(), 0);
    expect(a).toEqual(b);
  });
});
