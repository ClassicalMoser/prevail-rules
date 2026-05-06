import { describe, expect, it } from "vitest";

import { generateCompleteUnitMovementEvent } from "./generateCompleteUnitMovementEvent";

/**
 * Signals that the active unit’s movement command is fully resolved on the board.
 * Fixed `completeUnitMovement` effect only; apply layer finalizes movement bookkeeping.
 * Generator does not inspect board or phase beyond accepting GameState.
 */
describe("generateCompleteUnitMovementEvent", () => {
  it("emits gameEffect with effectType completeUnitMovement", () => {
    const event = generateCompleteUnitMovementEvent(0);
    expect(event.eventType).toBe("gameEffect");
    expect(event.effectType).toBe("completeUnitMovement");
  });
});
