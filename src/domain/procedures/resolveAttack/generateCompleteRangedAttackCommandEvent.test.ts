import { describe, expect, it } from "vitest";

import { generateCompleteRangedAttackCommandEvent } from "./generateCompleteRangedAttackCommandEvent";

/**
 * Completes the ranged-attack command resolution sub-flow (after apply chain finishes).
 * Fixed `completeRangedAttackCommand` game effect; implementation does not read `state`.
 */
describe("generateCompleteRangedAttackCommandEvent", () => {
  it("given any game state, emits gameEffect with effectType completeRangedAttackCommand", () => {
    const event = generateCompleteRangedAttackCommandEvent(0);
    expect(event.eventType).toBe("gameEffect");
    expect(event.effectType).toBe("completeRangedAttackCommand");
  });
});
