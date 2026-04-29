import { createTestCard } from "@testing";
import { describe, expect, it } from "vitest";
import { calculateInitiative } from "./calculateInitiative";

/**
 * calculateInitiative: compares played cards' initiative values; lower wins; on a tie, initiative stays with
 * the current holder.
 */
describe("calculateInitiative", () => {
  it("given white card lower initiative, white takes initiative", () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 3 });

    expect(calculateInitiative(whiteCard, blackCard, "black")).toBe("white");
  });

  it("given black card lower initiative, black takes initiative", () => {
    const whiteCard = createTestCard({ initiative: 4 });
    const blackCard = createTestCard({ initiative: 1 });

    expect(calculateInitiative(whiteCard, blackCard, "white")).toBe("black");
  });

  it("given tied initiative, keeps current initiative", () => {
    const whiteCard = createTestCard({ initiative: 2 });
    const blackCard = createTestCard({ initiative: 2 });

    expect(calculateInitiative(whiteCard, blackCard, "white")).toBe("white");
    expect(calculateInitiative(whiteCard, blackCard, "black")).toBe("black");
  });
});
