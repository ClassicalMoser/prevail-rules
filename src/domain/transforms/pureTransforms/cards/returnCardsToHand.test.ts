import { tempCommandCards } from "@sampleValues";
import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";
import { returnCardsToHand } from "./returnCardsToHand";

/**
 * returnCardsToHand: Returns all played and discarded cards to the player's hand.
 */
describe("returnCardsToHand", () => {
  it("given context, returns all played and discarded cards to hand", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0]],
        played: [tempCommandCards[1]],
        discarded: [tempCommandCards[2]],
      },
    };

    const newCardState = returnCardsToHand(cardState, "black");

    expect(newCardState.black.inHand).toEqual([
      tempCommandCards[0],
      tempCommandCards[1],
      tempCommandCards[2],
    ]);
    expect(newCardState.black.played).toEqual([]);
    expect(newCardState.black.discarded).toEqual([]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it("given handle empty played and discarded", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0]],
        played: [],
        discarded: [],
      },
    };

    const newCardState = returnCardsToHand(cardState, "black");

    expect(newCardState.black.inHand).toEqual([tempCommandCards[0]]);
    expect(newCardState.black.played).toEqual([]);
    expect(newCardState.black.discarded).toEqual([]);
  });

  it("given preserve order: hand, then played, then discarded", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0]],
        played: [tempCommandCards[1]],
        discarded: [tempCommandCards[2]],
      },
    };

    const newCardState = returnCardsToHand(cardState, "black");

    expect(newCardState.black.inHand[0]).toBe(tempCommandCards[0]);
    expect(newCardState.black.inHand[1]).toBe(tempCommandCards[1]);
    expect(newCardState.black.inHand[2]).toBe(tempCommandCards[2]);
  });

  it("given not mutate the original card state", () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [tempCommandCards[0]],
        played: [tempCommandCards[1]],
        discarded: [tempCommandCards[2]],
      },
    };
    const originalHand = cardState.black.inHand;
    const originalPlayed = cardState.black.played;
    const originalDiscarded = cardState.black.discarded;

    returnCardsToHand(cardState, "black");

    expect(cardState.black.inHand).toBe(originalHand);
    expect(cardState.black.played).toBe(originalPlayed);
    expect(cardState.black.discarded).toBe(originalDiscarded);
  });
});
