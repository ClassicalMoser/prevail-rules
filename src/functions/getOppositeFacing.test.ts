import { describe, expect, it } from "vitest";
import { getOppositeFacing } from "./getOppositeFacing.js";

describe("getOppositeFacing", () => {
  it("should return the opposite facing", () => {
    expect(getOppositeFacing("north")).toBe("south");
    expect(getOppositeFacing("northEast")).toBe("southWest");
    expect(getOppositeFacing("east")).toBe("west");
    expect(getOppositeFacing("southEast")).toBe("northWest");
    expect(getOppositeFacing("south")).toBe("north");
    expect(getOppositeFacing("southWest")).toBe("northEast");
    expect(getOppositeFacing("west")).toBe("east");
    expect(getOppositeFacing("northWest")).toBe("southEast");
  });
});
