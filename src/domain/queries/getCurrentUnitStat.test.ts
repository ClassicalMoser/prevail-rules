import {
  createBoardWithCommander,
  createBoardWithUnits,
  createEmptyGameState,
  createTestCard,
  createTestUnit,
} from "@testing";
import { describe, expect, it } from "vitest";
import { getCurrentUnitStat } from "./getCurrentUnitStat";

/**
 * getCurrentUnitStat: effective stat with base unit type, round effects, command modifiers, and extra modifiers.
 */
describe("getCurrentUnitStat", () => {
  describe("base stat without modifiers", () => {
    it("given no card is in play, returns base stat", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3);
    });

    it("given in-play round effect has no modifier for that stat, returns base attack", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      // roundEffect exists (inspiration restriction present) but modifiers omit attack — only command modifiers apply when commanded
      gameState.cardState.black.inPlay = createTestCard({
        id: "2",
        name: "Command Card 2",
        initiative: 2,
        modifiers: [{ type: "attack", value: 1 }],
        roundEffectModifiers: [],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3);
    });

    it("given no modifiers apply, returns base stat for white inPlay", () => {
      const unit = createTestUnit("white", { attack: 2 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.cardState.white.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "speed", value: 1 }],
      });

      expect(getCurrentUnitStat(unit, "attack", gameState)).toBe(2);
    });
  });

  describe("round effect modifiers", () => {
    it("given unrestricted round effect modifier, applies to stat", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "attack", value: 2 }],
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(5); // 3 base + 2 modifier
    });

    it("given unit does not match stat, does not apply round effect modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "speed", value: 1 }], // Different stat
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it("given defense-type round modifier, applies to reverse/rout/retreat", () => {
      const unit = createTestUnit("black", { reverse: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "defense", value: 1 }],
      });

      const result = getCurrentUnitStat(unit, "reverse", gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });
  });

  describe("round effect with inspiration range restriction", () => {
    it("given unit is within inspiration range, applies modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.boardState = createBoardWithCommander("black", "E-6", gameState.boardState);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "attack", value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it("given unit is outside inspiration range, does not apply modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.boardState = createBoardWithCommander("black", "E-8", gameState.boardState);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "attack", value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it("given commander is not on board, does not apply modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "attack", value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3); // No modifier applied (commander defeated)
    });
  });

  describe("round effect with unit restrictions", () => {
    it("given trait and unit restriction lists are empty, applies round effect modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "attack", value: 1 }],
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it("given unit does not match unit restrictions, does not apply modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: "attack", value: 1 }],
        roundEffectRestrictions: { unitRestrictions: ["different-unit-id"] },
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe("active command modifiers", () => {
    it("given no card is in play, ignores command modifiers", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);

      const result = getCurrentUnitStat(unit, "attack", gameState);

      expect(result).toBe(3);
    });

    it("given missing command.modifiers on in-play card, treats as empty list", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = {
        ...createTestCard(),
        command: {
          ...createTestCard().command,
          modifiers: undefined as unknown as never[],
        },
      };

      const result = getCurrentUnitStat(unit, "attack", gameState);

      expect(result).toBe(3);
    });

    it("given unit was commanded, applies command modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: "attack", value: 2 }],
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(5); // 3 base + 2 modifier
    });

    it("given unit was not commanded, does not apply command modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.currentRoundState.commandedUnits = new Set(); // Empty
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: "attack", value: 2 }],
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it("given stat does not match, does not apply command modifier", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: "speed", value: 1 }], // Different stat
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe("additional modifiers", () => {
    it("given extra modifier list with matching stat, stacks on base", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);

      const result = getCurrentUnitStat(unit, "attack", gameState, [{ type: "attack", value: 2 }]);

      expect(result).toBe(5);
    });

    it("given defense extra modifier, applies to defense stat", () => {
      const unit = createTestUnit("black", { reverse: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);

      const result = getCurrentUnitStat(unit, "reverse", gameState, [
        { type: "defense", value: 1 },
      ]);

      expect(result).toBe(4);
    });

    it("given non-matching extra modifiers, ignores them", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);

      const result = getCurrentUnitStat(unit, "attack", gameState, [{ type: "speed", value: 1 }]);

      expect(result).toBe(3);
    });
  });

  describe("multiple modifiers stacking", () => {
    it("given round effect and command modifiers, stacks both", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: "attack", value: 1 }],
        roundEffectModifiers: [{ type: "attack", value: 2 }],
      });

      const result = getCurrentUnitStat(unit, "attack", gameState);
      expect(result).toBe(6); // 3 base + 2 round effect + 1 command
    });
  });
});
