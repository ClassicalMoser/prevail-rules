import { describe, expect, it } from "vitest";

import { generateRevealCardsEvent } from "./generateRevealCardsEvent";

/**
 * Reveal cards step: both players’ awaitingPlay cards become public knowledge.
 * The procedure only emits the effect tag — apply layer performs the reveal.
 */
describe("generateRevealCardsEvent", () => {
  it("emits gameEffect with effectType revealCards", () => {
    const event = generateRevealCardsEvent(0);
    expect(event.eventType).toBe("gameEffect");
    expect(event.effectType).toBe("revealCards");
  });
});
