import { phases } from "src/entities/sequence/phases.js";
import { describe, expect, it } from "vitest";
import { getNextPhase } from "./getNextPhase.js";

describe("getNextPhase", () => {
  it("should return the next phase for each phase and wrap around", () => {
    for (let i = 0; i < phases.length; i++) {
      expect(getNextPhase(phases[i])).toBe(phases[(i + 1) % phases.length]);
    }
  });
});
