import { describe, expect, it } from "vitest";
import { isEngagementFromRear } from "./isEngagementFromRear";

/**
 * isEngagementFromRear: true when the attacker's facing matches the defender's or one of the defender's
 * compass-adjacent facings (rear / same-direction band).
 */
describe("isEngagementFromRear", () => {
  it("given attacker facing matches defender, returns success", () => {
    expect(isEngagementFromRear("north", "north")).toEqual({ result: true });
  });

  it("given attacker outside defender adjacent band, returns false with reason", () => {
    expect(isEngagementFromRear("south", "north")).toEqual({
      result: false,
      errorReason: "Attacker is not facing a similar direction to the defender",
    });
  });
});
