import { createReverseState, createUnitWithPlacement } from "@testing";
import { describe, expect, it } from "vitest";
import { getExpectedReverseEvent } from "./getExpectedReverseEvent";

/**
 * getExpectedReverseEvent: next reverse-resolution event from reverse substate.
 */
describe("getExpectedReverseEvent", () => {
  const unitPlacement = createUnitWithPlacement();

  it("given resolve reverse when the final position has not been determined yet", () => {
    const reverseState = createReverseState(unitPlacement);

    expect(getExpectedReverseEvent(reverseState)).toEqual({
      actionType: "gameEffect",
      effectType: "resolveReverse",
    });
  });

  it("given when the reverse is already complete, throws", () => {
    const reverseState = createReverseState(unitPlacement, {
      completed: true,
      finalPosition: {
        boardType: "standard" as const,
        coordinate: "E-4",
        facing: "south",
      },
    });

    expect(() => getExpectedReverseEvent(reverseState)).toThrow(
      "Reverse state is already complete",
    );
  });

  it("given when the final position is already set but the state is incomplete, throws", () => {
    const reverseState = createReverseState(unitPlacement, {
      finalPosition: {
        boardType: "standard" as const,
        coordinate: "E-4",
        facing: "south",
      },
    });

    expect(() => getExpectedReverseEvent(reverseState)).toThrow(
      "Reverse state has final position but not marked as completed",
    );
  });
});
