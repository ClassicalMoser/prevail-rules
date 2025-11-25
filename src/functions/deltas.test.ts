import { describe, expect, it } from "vitest";
import { getColumnDelta, getRowDelta } from "./deltas.js";

describe("getRowDelta", () => {
  it("should return -1 for north facing", () => {
    expect(getRowDelta("north")).toBe(-1);
  });

  it("should return -1 for northEast facing", () => {
    expect(getRowDelta("northEast")).toBe(-1);
  });

  it("should return -1 for northWest facing", () => {
    expect(getRowDelta("northWest")).toBe(-1);
  });

  it("should return 1 for south facing", () => {
    expect(getRowDelta("south")).toBe(1);
  });

  it("should return 1 for southEast facing", () => {
    expect(getRowDelta("southEast")).toBe(1);
  });

  it("should return 1 for southWest facing", () => {
    expect(getRowDelta("southWest")).toBe(1);
  });

  it("should return 0 for east facing", () => {
    expect(getRowDelta("east")).toBe(0);
  });

  it("should return 0 for west facing", () => {
    expect(getRowDelta("west")).toBe(0);
  });
});

describe("getColumnDelta", () => {
  it("should return 1 for east facing", () => {
    expect(getColumnDelta("east")).toBe(1);
  });

  it("should return 1 for northEast facing", () => {
    expect(getColumnDelta("northEast")).toBe(1);
  });

  it("should return 1 for southEast facing", () => {
    expect(getColumnDelta("southEast")).toBe(1);
  });

  it("should return -1 for west facing", () => {
    expect(getColumnDelta("west")).toBe(-1);
  });

  it("should return -1 for northWest facing", () => {
    expect(getColumnDelta("northWest")).toBe(-1);
  });

  it("should return -1 for southWest facing", () => {
    expect(getColumnDelta("southWest")).toBe(-1);
  });

  it("should return 0 for north facing", () => {
    expect(getColumnDelta("north")).toBe(0);
  });

  it("should return 0 for south facing", () => {
    expect(getColumnDelta("south")).toBe(0);
  });
});

