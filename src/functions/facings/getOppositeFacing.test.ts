import { getOppositeFacing } from "@functions/facings/getOppositeFacing.js";
import { describe, expect, it } from "vitest";

describe("getOppositeFacing", () => {
  it("should return south for north", () => {
    expect(getOppositeFacing("north")).toBe("south");
  });
  it("should return southWest for northEast", () => {
    expect(getOppositeFacing("northEast")).toBe("southWest");
  });
  it("should return west for east", () => {
    expect(getOppositeFacing("east")).toBe("west");
  });
  it("should return northWest for southEast", () => {
    expect(getOppositeFacing("southEast")).toBe("northWest");
  });
  it("should return north for south", () => {
    expect(getOppositeFacing("south")).toBe("north");
  });
  it("should return northEast for southWest", () => {
    expect(getOppositeFacing("southWest")).toBe("northEast");
  });
  it("should return east for west", () => {
    expect(getOppositeFacing("west")).toBe("east");
  });
  it("should return southEast for northWest", () => {
    expect(getOppositeFacing("northWest")).toBe("southEast");
  });
});
