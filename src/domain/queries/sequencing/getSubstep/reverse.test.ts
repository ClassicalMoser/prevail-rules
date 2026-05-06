import type { StandardBoard, UnitWithPlacement } from "@entities";
import type { AttackApplyStateForBoard, GameStateForBoard } from "@game";
import {
  createAttackApplyStateWithReverse,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createReverseState,
  createTestUnit,
} from "@testing";
import { addUnitToBoard, updatePhaseState } from "@transforms";
import { describe, expect, it } from "vitest";
import {
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
} from "./reverse";

/**
 * Reverse substep accessors: unwrap reverse from one apply, or choose melee side by initiative
 * and whether the first player’s reverse already has a final facing committed.
 */
describe("getReverseStateFromAttackApply", () => {
  it("given apply with reverse substep, returns reverseState", () => {
    const unit = createTestUnit("black", { attack: 2 });
    const attackApplyState: AttackApplyStateForBoard<StandardBoard> = {
      substepType: "attackApply" as const,
      boardType: "standard" as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: true,
      },
      routState: undefined,
      retreatState: undefined,
      reverseState: {
        substepType: "reverse" as const,
        boardType: "standard" as const,
        reversingUnit: {
          boardType: "standard" as const,
          unit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-5",
            facing: "north",
          },
        },
        finalPosition: undefined,
        completed: false,
      },
      completed: false,
    };

    const result = getReverseStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe("reverse");
    expect(result.reversingUnit.unit).toEqual(unit);
  });

  it("given error when reverse state is missing, throws", () => {
    const unit = createTestUnit("black", { attack: 2 });
    const attackApplyState: AttackApplyStateForBoard<StandardBoard> = {
      substepType: "attackApply" as const,
      boardType: "standard" as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: false,
      },
      routState: undefined,
      retreatState: undefined,
      reverseState: undefined,
      completed: false,
    };

    expect(() => getReverseStateFromAttackApply(attackApplyState)).toThrow(
      "No reverse state found in attack apply state",
    );
  });
});

describe("getReverseStateFromMeleeResolutionByInitiative", () => {
  /** Both sides in reverse substeps; optional finalPosition on initiative side to simulate done. */
  function stateWithReverse(
    initiative: "white" | "black",
    firstFinal?: "set",
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: initiative });
    const whiteUnit = createTestUnit("white", { attack: 2 });
    const blackUnit = createTestUnit("black", { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: whiteUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "east",
      },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: blackUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "west",
      },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteRev = createAttackApplyStateWithReverse(whiteWp, {
      reverseState: createReverseState(whiteWp, {
        finalPosition:
          initiative === "white" && firstFinal === "set" ? whiteWp.placement : undefined,
      }),
    });
    const blackRev = createAttackApplyStateWithReverse(blackWp, {
      reverseState: createReverseState(blackWp, {
        finalPosition:
          initiative === "black" && firstFinal === "set" ? blackWp.placement : undefined,
      }),
    });

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteRev,
      blackAttackApplyState: blackRev,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(s, phase);
  }

  it("given white initiative and both reverses pending, picks white", () => {
    const state = stateWithReverse("white");
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe("white");
  });

  it("given black initiative and both reverses pending, picks black", () => {
    const state = stateWithReverse("black");
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe("black");
  });

  it("given white initiative but white reverse already has finalPosition, picks black", () => {
    const state = stateWithReverse("white", "set");
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe("black");
  });

  it("given black initiative but black reverse already has finalPosition, picks white", () => {
    const state = stateWithReverse("black", "set");
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe("white");
  });

  it("given both reverses already have finalPosition, throws no reverse in melee", () => {
    const state = createEmptyGameState({ currentInitiative: "white" });
    const whiteUnit = createTestUnit("white", { attack: 2 });
    const blackUnit = createTestUnit("black", { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: whiteUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "east",
      },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: blackUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "west",
      },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const doneWhite = createAttackApplyStateWithReverse(whiteWp, {
      reverseState: {
        substepType: "reverse",
        boardType: "standard" as const,
        reversingUnit: whiteWp,
        finalPosition: whiteWp.placement,
        completed: false,
      },
    });
    const doneBlack = createAttackApplyStateWithReverse(blackWp, {
      reverseState: {
        substepType: "reverse",
        boardType: "standard" as const,
        reversingUnit: blackWp,
        finalPosition: blackWp.placement,
        completed: false,
      },
    });

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: doneWhite,
      blackAttackApplyState: doneBlack,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    expect(() => getReverseStateFromMeleeResolutionByInitiative(full)).toThrow(
      "No reverse state found in melee resolution",
    );
  });
});
