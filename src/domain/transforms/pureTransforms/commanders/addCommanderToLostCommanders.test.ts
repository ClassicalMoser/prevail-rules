import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";
import { addCommanderToLostCommanders } from "./addCommanderToLostCommanders";

/**
 * addCommanderToLostCommanders: addCommanderToLostCommanders.
 */
describe("addCommanderToLostCommanders", () => {
  describe("adding commander to empty set", () => {
    it("given add commander to lost commanders set", () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, "black");

      expect(newGameState).not.toBe(gameState);
      expect(newGameState.lostCommanders).toEqual(new Set(["black"]));
    });

    it("given not mutate the original game state", () => {
      const gameState = createEmptyGameState();

      addCommanderToLostCommanders(gameState, "white");

      expect(gameState.lostCommanders).toEqual(new Set());
    });
  });

  describe("adding multiple commanders", () => {
    it("given add second commander while preserving first", () => {
      const gameState = createEmptyGameState();
      const gameStateWithBlack = addCommanderToLostCommanders(gameState, "black");

      const newGameState = addCommanderToLostCommanders(gameStateWithBlack, "white");

      expect(newGameState.lostCommanders).toEqual(new Set(["black", "white"]));
    });

    it("given adding second commander, does not mutate the original game state", () => {
      const gameState = createEmptyGameState();
      const gameStateWithBlack = addCommanderToLostCommanders(gameState, "black");

      addCommanderToLostCommanders(gameStateWithBlack, "white");

      expect(gameStateWithBlack.lostCommanders).toEqual(new Set(["black"]));
    });
  });

  describe("error cases", () => {
    it("given error when commander already lost, throws", () => {
      const gameState = createEmptyGameState();
      const gameStateWithBlack = addCommanderToLostCommanders(gameState, "black");

      expect(() => addCommanderToLostCommanders(gameStateWithBlack, "black")).toThrow(
        "Commander already lost",
      );
    });

    it("given error when trying to add already lost white commander, throws", () => {
      const gameState = createEmptyGameState();
      const gameStateWithWhite = addCommanderToLostCommanders(gameState, "white");

      expect(() => addCommanderToLostCommanders(gameStateWithWhite, "white")).toThrow(
        "Commander already lost",
      );
    });
  });

  describe("preserving other game state", () => {
    it("given preserve routed units", () => {
      const gameState = createEmptyGameState();
      const newGameState = addCommanderToLostCommanders(gameState, "black");

      expect(newGameState.routedUnits).toBe(gameState.routedUnits);
    });

    it("given preserve reserved units", () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, "black");

      expect(newGameState.reservedUnits).toBe(gameState.reservedUnits);
    });

    it("given preserve board state", () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, "black");

      expect(newGameState.boardState).toBe(gameState.boardState);
    });

    it("given preserve card state", () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, "black");

      expect(newGameState.cardState).toBe(gameState.cardState);
    });
  });
});
