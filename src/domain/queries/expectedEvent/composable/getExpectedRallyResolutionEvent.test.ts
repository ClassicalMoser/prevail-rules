import { createRallyResolutionState, createRoutState, createTestUnit } from "@testing";
import { describe, expect, it } from "vitest";
import { getExpectedRallyResolutionEvent } from "./getExpectedRallyResolutionEvent";

/**
 * getExpectedRallyResolutionEvent: next rally-resolution step as choice or effect from rally state.
 */
describe("getExpectedRallyResolutionEvent", () => {
  it("given resolve rally when the rally has not yet been resolved", () => {
    const rallyState = createRallyResolutionState();

    expect(getExpectedRallyResolutionEvent(rallyState)).toEqual({
      actionType: "gameEffect",
      effectType: "resolveRally",
    });
  });

  it("given resolve routs when the rally is resolved and support was lost", () => {
    const unit = createTestUnit("black");
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set([unit]),
      routState: createRoutState("black", unit),
    });

    expect(getExpectedRallyResolutionEvent(rallyState)).toEqual({
      actionType: "gameEffect",
      effectType: "resolveRout",
    });
  });

  it("given resolve broken units when the rally is resolved and no support was lost yet", () => {
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: undefined,
    });

    expect(getExpectedRallyResolutionEvent(rallyState)).toEqual({
      actionType: "gameEffect",
      effectType: "resolveUnitsBroken",
    });
  });

  it("given when support was lost but no rout state exists, throws", () => {
    const unit = createTestUnit("black");
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set([unit]),
      routState: undefined,
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      "Rout state is required when units lost support",
    );
  });

  it("given when the rally is resolved but no units lost support and the state is incomplete, throws", () => {
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      "Rally resolution complete but step not advanced",
    );
  });

  it("given when the rally is already complete, throws", () => {
    const rallyState = createRallyResolutionState({
      completed: true,
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      "Rally resolution state is already complete",
    );
  });

  it("given when support was lost and rout is complete but rally is still incomplete, throws", () => {
    const unit = createTestUnit("black");
    const rallyState = createRallyResolutionState({
      rallyResolved: true,
      unitsLostSupport: new Set([unit]),
      routState: createRoutState("black", unit, {
        completed: true,
        numberToDiscard: 1,
        cardsChosen: true,
      }),
    });

    expect(() => getExpectedRallyResolutionEvent(rallyState)).toThrow(
      "Rally resolution complete but step not advanced",
    );
  });
});
