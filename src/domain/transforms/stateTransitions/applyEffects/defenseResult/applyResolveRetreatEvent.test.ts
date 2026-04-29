import type { StandardBoard, StandardUnitWithPlacement, UnitWithPlacement } from "@entities";
import type { ResolveRetreatEvent } from "@events";
import type { StandardGameState } from "@game";
import { getRetreatStateFromMelee, getRetreatStateFromRangedAttack } from "@queries";
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from "@testing";
import { addUnitToBoard, updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";
import { applyResolveRetreatEvent } from "./applyResolveRetreatEvent";

/**
 * Applies a committed retreat: removes the unit from `startingPosition`, places it at
 * `finalPosition`, and marks the nested retreat substep completed (ranged or melee side).
 */
describe("applyResolveRetreatEvent", () => {
  /** issueCommands + ranged CRS + retreat substep for white on E-5. */
  function createStateWithRangedAttackRetreat(): StandardGameState {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit("white", { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: retreatingUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "north",
      },
    };

    // Add unit to board
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    // Create attack apply state with retreat
    const attackApplyState = createAttackApplyStateWithRetreat(unitWithPlacement);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /** resolveMelee + one-sided retreat apply for the named player on engaged E-5. */
  function createStateWithMeleeRetreat(retreatingPlayer: "white" | "black"): StandardGameState {
    const state = createEmptyGameState({ currentInitiative: "black" });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(retreatingPlayer === "white" ? "black" : "white", {
      attack: 2,
    });

    const retreatingUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: retreatingUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "north",
      },
    };
    const otherUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: otherUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "south",
      },
    };

    // Add both units to board (engaged)
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, retreatingUnitWithPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherUnitWithPlacement),
    };

    // Create attack apply state with retreat for the retreating player
    const attackApplyState = createAttackApplyStateWithRetreat(retreatingUnitWithPlacement);
    const meleeState = createMeleeResolutionState(
      stateWithUnits,
      retreatingPlayer === "white"
        ? { whiteAttackApplyState: attackApplyState }
        : { blackAttackApplyState: attackApplyState },
    );
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe("ranged retreat apply", () => {
    it("given ranged retreat and event E-4 north, E-5 clears and E-4 holds retreating unit", () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "resolveRetreat",
        boardType: "standard",
        startingPosition: retreatState.retreatingUnit as StandardUnitWithPlacement,
        finalPosition: {
          boardType: "standard" as const,
          unit: retreatState.retreatingUnit.unit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-4",
            facing: "north",
          },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);

      // Unit should be removed from starting position
      const startingSpace = newState.boardState.board["E-5"];
      expect(startingSpace?.unitPresence.presenceType).toBe("none");

      // Unit should be added to final position
      const finalSpace = newState.boardState.board["E-4"];
      expect(finalSpace?.unitPresence.presenceType).toBe("single");
      if (finalSpace?.unitPresence.presenceType === "single") {
        expect(finalSpace.unitPresence.unit).toEqual(retreatState.retreatingUnit.unit);
        expect(finalSpace.unitPresence.facing).toBe("north");
      }
    });

    it("given same flow, ranged retreat substep completed becomes true", () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "resolveRetreat",
        boardType: "standard",
        startingPosition: retreatState.retreatingUnit as StandardUnitWithPlacement,
        finalPosition: {
          boardType: "standard" as const,
          unit: retreatState.retreatingUnit.unit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-4",
            facing: "north",
          },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromRangedAttack(newState);

      expect(newRetreatState.completed).toBe(true);
    });

    it("given extra black unit on D-5, after retreat D-5 single presence unchanged", () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      // Add another unit at a different location
      const otherUnit = createTestUnit("black", { attack: 2 });
      const stateWithOtherUnit = {
        ...state,
        boardState: addUnitToBoard(state.boardState, {
          boardType: "standard" as const,
          unit: otherUnit,
          placement: {
            boardType: "standard" as const,
            coordinate: "D-5",
            facing: "north",
          },
        }),
      };

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "resolveRetreat",
        boardType: "standard",
        startingPosition: retreatState.retreatingUnit as StandardUnitWithPlacement,
        finalPosition: {
          boardType: "standard" as const,
          unit: retreatState.retreatingUnit.unit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-4",
            facing: "north",
          },
        },
      };

      const newState = applyResolveRetreatEvent(event, stateWithOtherUnit);

      // Other unit should still be at D-5
      const otherSpace = newState.boardState.board["D-5"];
      expect(otherSpace?.unitPresence.presenceType).toBe("single");
      if (otherSpace?.unitPresence.presenceType === "single") {
        expect(otherSpace.unitPresence.unit).toEqual(otherUnit);
      }
    });
  });

  describe("melee retreat apply", () => {
    it("given black retreats off E-5 to E-4, retreat completed and both hexes single occupancy", () => {
      const state = createStateWithMeleeRetreat("black");
      const retreatState = getRetreatStateFromMelee(state, "black");

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "resolveRetreat",
        boardType: "standard",
        startingPosition: retreatState.retreatingUnit as StandardUnitWithPlacement,
        finalPosition: {
          boardType: "standard" as const,
          unit: retreatState.retreatingUnit.unit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-4",
            facing: "north",
          },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, "black");

      expect(newRetreatState.completed).toBe(true);
      expect(newState.boardState.board["E-5"]?.unitPresence.presenceType).toBe("single");
      expect(newState.boardState.board["E-4"]?.unitPresence.presenceType).toBe("single");
    });

    it("given white retreats to E-6 south, retreat completed and white on E-6", () => {
      const state = createStateWithMeleeRetreat("white");
      const retreatState = getRetreatStateFromMelee(state, "white");

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "resolveRetreat",
        boardType: "standard",
        startingPosition: retreatState.retreatingUnit as StandardUnitWithPlacement,
        finalPosition: {
          boardType: "standard" as const,
          unit: retreatState.retreatingUnit.unit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-6",
            facing: "south",
          },
        },
      };

      const newState = applyResolveRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, "white");

      expect(newRetreatState.completed).toBe(true);
      expect(newState.boardState.board["E-5"]?.unitPresence.presenceType).toBe("single");
      expect(newState.boardState.board["E-6"]?.unitPresence.presenceType).toBe("single");
    });
  });

  describe("structural update", () => {
    it("given retreat completed flag and board ref before apply, input unchanged after apply", () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);
      const originalCompleted = retreatState.completed;
      const originalBoardState = state.boardState;

      const event: ResolveRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "resolveRetreat",
        boardType: "standard",
        startingPosition: retreatState.retreatingUnit as StandardUnitWithPlacement,
        finalPosition: {
          boardType: "standard" as const,
          unit: retreatState.retreatingUnit.unit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-4",
            facing: "north",
          },
        },
      };

      applyResolveRetreatEvent(event, state);

      expect(retreatState.completed).toBe(originalCompleted);
      expect(state.boardState).toBe(originalBoardState);
    });
  });
});
