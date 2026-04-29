import { tempCommandCards } from "@sampleValues";
import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";
import { discardCardsFromHand } from "./discardCardsFromHand";

/**
 * discardCardsFromHand: Pure transform to move specified cards from hand to discarded pile.
 */
describe("discardCardsFromHand", () => {
  it("given move cards from hand to discarded", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
        discarded: [],
      },
    };

    const newCardState = discardCardsFromHand(cardState, "black", [
      tempCommandCards[0].id,
      tempCommandCards[2].id,
    ]);

    expect(newCardState.black.inHand).toEqual([tempCommandCards[1]]);
    expect(newCardState.black.discarded).toEqual([tempCommandCards[0], tempCommandCards[2]]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it("given not mutate the original card state", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0], tempCommandCards[1]],
        discarded: [],
      },
    };
    const originalHand = cardState.black.inHand;
    const originalDiscarded = cardState.black.discarded;

    discardCardsFromHand(cardState, "black", [tempCommandCards[0].id]);

    expect(cardState.black.inHand).toBe(originalHand);
    expect(cardState.black.discarded).toBe(originalDiscarded);
  });

  it("given append to existing discarded cards", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0], tempCommandCards[1]],
        discarded: [tempCommandCards[2]],
      },
    };

    const newCardState = discardCardsFromHand(cardState, "black", [tempCommandCards[0].id]);

    expect(newCardState.black.discarded).toEqual([tempCommandCards[2], tempCommandCards[0]]);
  });

  it("given handle multiple cards", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
        discarded: [],
      },
    };

    const newCardState = discardCardsFromHand(cardState, "black", [
      tempCommandCards[0].id,
      tempCommandCards[1].id,
      tempCommandCards[2].id,
    ]);

    expect(newCardState.black.inHand).toEqual([]);
    expect(newCardState.black.discarded).toEqual([
      tempCommandCards[0],
      tempCommandCards[1],
      tempCommandCards[2],
    ]);
  });
});
