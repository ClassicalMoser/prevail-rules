import { createEmptyGameState, createTestCard } from "@testing";
import { describe, expect, it } from "vitest";
import { getExpectedStartCommandResolutionEvent } from "./getExpectedStartCommandResolutionEvent";

/**
 * getExpectedStartCommandResolutionEvent: first command-resolution choice from active card command type.
 */
describe("getExpectedStartCommandResolutionEvent", () => {
  it("given ask the player to move a unit for a movement card", () => {
    const state = createEmptyGameState();
    // createTestCard() defaults command.type to 'movement'
    state.cardState.black.inPlay = createTestCard();

    expect(getExpectedStartCommandResolutionEvent(state, "black")).toEqual({
      actionType: "playerChoice",
      playerSource: "black",
      choiceType: "moveUnit",
    });
  });

  it("given ask the player to perform a ranged attack for a ranged attack card", () => {
    const state = createEmptyGameState();
    state.cardState.white.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: "rangedAttack",
      },
    };

    expect(getExpectedStartCommandResolutionEvent(state, "white")).toEqual({
      actionType: "playerChoice",
      playerSource: "white",
      choiceType: "performRangedAttack",
    });
  });

  it("given when the player has no active card, throws", () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = null;

    expect(() => getExpectedStartCommandResolutionEvent(state, "black")).toThrow(
      "black player has no active card",
    );
  });

  it("given when the command type is invalid, throws", () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: "invalidCommandType" as never, // Intentional invalid command type for error coverage.
      },
    };

    expect(() => getExpectedStartCommandResolutionEvent(state, "black")).toThrow(
      "Invalid command type: invalidCommandType",
    );
  });
});
