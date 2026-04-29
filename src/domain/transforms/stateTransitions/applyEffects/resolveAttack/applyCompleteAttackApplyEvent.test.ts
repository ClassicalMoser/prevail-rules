import type { StandardBoard, UnitWithPlacement } from "@entities";
import type { CompleteAttackApplyEvent } from "@events";
import type { StandardGameState, StandardMeleeResolutionState } from "@game";
import { getAttackApplyStateFromRangedAttack, getMeleeResolutionState } from "@queries";
import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from "@testing";
import { addUnitToBoard, updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";
import { applyCompleteAttackApplyEvent } from "./applyCompleteAttackApplyEvent";

/**
 * Marks the active attack-apply substep finished for the defending player named in the event
 * (ranged single apply vs melee side chosen by initiative order).
 */
describe("applyCompleteAttackApplyEvent", () => {
  /** issueCommands + ranged CRS + incomplete apply for white defender on E-5. */
  function createStateWithRangedAttackApply(): StandardGameState {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit("white", { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: defendingUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "north",
      },
    };

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState = createAttackApplyState(defendingUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /** resolveMelee + two applies; pass side still incomplete or omit for both complete. */
  function createStateWithMeleeApply(incompletePlayer?: "white" | "black"): StandardGameState {
    const state = createEmptyGameState({ currentInitiative: "black" });
    const whiteUnit = createTestUnit("white", { attack: 2 });
    const blackUnit = createTestUnit("black", { attack: 2 });

    const whiteUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: whiteUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "north",
      },
    };
    const blackUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: blackUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "south",
      },
    };

    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, whiteUnitWithPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, blackUnitWithPlacement),
    };

    const whiteAttackApply = createAttackApplyState(whiteUnit, {
      completed: incompletePlayer !== "white",
    });
    const blackAttackApply = createAttackApplyState(blackUnit, {
      completed: incompletePlayer !== "black",
    });

    const meleeState = createMeleeResolutionState(stateWithUnits, {
      whiteAttackApplyState: whiteAttackApply,
      blackAttackApplyState: blackAttackApply,
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe("ranged apply", () => {
    it("given incomplete ranged apply, event defending white sets completed true", () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      expect(attackApplyState.completed).toBe(false);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "completeAttackApply",
        attackType: "ranged",
        defendingPlayer: "white",
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);

      expect(newAttackApplyState.completed).toBe(true);
    });

    it("given same completion, substepType defendingUnit and attackResult unchanged besides completed", () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "completeAttackApply",
        attackType: "ranged",
        defendingPlayer: "white",
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);

      expect(newAttackApplyState.substepType).toBe("attackApply");
      expect(newAttackApplyState.defendingUnit).toEqual(attackApplyState.defendingUnit);
      expect(newAttackApplyState.attackResult).toEqual(attackApplyState.attackResult);
    });
  });

  describe("melee apply", () => {
    it("given black initiative and black apply incomplete, completeAttackApply for black marks that side", () => {
      const state = createStateWithMeleeApply("black");
      const meleeState = getMeleeResolutionState(state);
      const firstPlayer = state.currentInitiative;
      const firstPlayerAttackApply =
        firstPlayer === "white"
          ? meleeState.whiteAttackApplyState
          : meleeState.blackAttackApplyState;

      expect(firstPlayerAttackApply?.completed).toBe(false);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "completeAttackApply",
        attackType: "melee",
        defendingPlayer: "black",
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newFirstPlayerAttackApply =
        firstPlayer === "white"
          ? newMeleeState.whiteAttackApplyState
          : newMeleeState.blackAttackApplyState;

      expect(newFirstPlayerAttackApply?.completed).toBe(true);
    });

    it("given white apply still incomplete after black done, event for white completes white apply", () => {
      const state = createStateWithMeleeApply("white");
      const meleeState = getMeleeResolutionState(state);
      const firstPlayer = state.currentInitiative;
      const secondPlayer = firstPlayer === "white" ? "black" : "white";
      const secondPlayerAttackApply =
        secondPlayer === "white"
          ? meleeState.whiteAttackApplyState
          : meleeState.blackAttackApplyState;

      expect(secondPlayerAttackApply?.completed).toBe(false);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "completeAttackApply",
        attackType: "melee",
        defendingPlayer: "white",
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newSecondPlayerAttackApply =
        secondPlayer === "white"
          ? newMeleeState.whiteAttackApplyState
          : newMeleeState.blackAttackApplyState;

      expect(newSecondPlayerAttackApply?.completed).toBe(true);
    });
  });

  describe("structural update", () => {
    it("given ranged apply completed false before apply, input apply object unchanged after apply", () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const originalCompleted = attackApplyState.completed;

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "completeAttackApply",
        attackType: "ranged",
        defendingPlayer: "white",
      };

      applyCompleteAttackApplyEvent(event, state);

      expect(attackApplyState.completed).toBe(originalCompleted);
    });
  });

  describe("errors", () => {
    it("given empty state without issueCommands ranged CRS, throws not in issueCommands phase", () => {
      const state = createEmptyGameState();

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "completeAttackApply",
        attackType: "ranged",
        defendingPlayer: "white",
      };

      expect(() => applyCompleteAttackApplyEvent(event, state)).toThrow(
        "Not in issueCommands phase",
      );
    });

    it("given melee missing whiteAttackApplyState, complete for white throws no white apply", () => {
      const state = createStateWithMeleeApply("black");
      const meleeState = getMeleeResolutionState(state);
      const phaseState = createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: {
          ...meleeState,
          whiteAttackApplyState: undefined,
        } as StandardMeleeResolutionState,
      });
      const stateMissingWhiteApply = updatePhaseState(state, phaseState);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "completeAttackApply",
        attackType: "melee",
        defendingPlayer: "white",
      };

      expect(() => applyCompleteAttackApplyEvent(event, stateMissingWhiteApply)).toThrow(
        "No white attack apply state found in melee resolution",
      );
    });

    it("given attackType siege cast, throws unknown attack type for completeAttackApply", () => {
      const state = createEmptyGameState();
      const event = {
        eventNumber: 0,
        eventType: "gameEffect" as const,
        effectType: "completeAttackApply" as const,
        attackType: "siege",
        defendingPlayer: "white" as const,
      } as unknown as CompleteAttackApplyEvent<StandardBoard>;

      expect(() => applyCompleteAttackApplyEvent(event, state)).toThrow(
        "Unknown attack type for completeAttackApply: siege",
      );
    });
  });
});
