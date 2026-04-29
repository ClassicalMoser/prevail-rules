import type { StandardBoard, UnitWithPlacement } from "@entities";
import type { StandardGameState } from "@game";
import { equites, punicCitizenSpearmen, velites } from "@sampleValues";
import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
} from "@testing";
import { addUnitToBoard, updatePhaseState } from "@transforms";
import { describe, expect, it } from "vitest";

import { generateResolveRangedAttackEvent } from "./generateResolveRangedAttackEvent";

/** Citizen spearmen: default `inPlay` (+1 attack) keeps strike below retreat. */
const spearmenType = punicCitizenSpearmen;

/**
 * `resolveRangedAttack` is the first ranged strike roll: attacker/defender commitments must be
 * settled, and there must be no attack-apply substep yet. Outcome exposes rout/retreat/reverse
 * flags and optional legal retreat cells when retreat applies.
 */
describe("generateResolveRangedAttackEvent", () => {
  /** Spearmen duel on E-5 under issueCommands ranged CRS; default commitments resolved. */
  function rangedResolutionGameState(): StandardGameState {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit("white", { unitType: spearmenType });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: defendingUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "north",
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackingUnit: createTestUnit("black", { unitType: spearmenType }),
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  }

  it("given low-retreat defender vs cavalry attacker, retreated true with legal set", () => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit("white", { unitType: velites });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: defendingUnit,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "north",
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackingUnit: createTestUnit("black", { unitType: equites }),
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    const event = generateResolveRangedAttackEvent(full, 0);
    expect(event.retreated).toBe(true);
    expect(event.legalRetreatOptions).toBeInstanceOf(Set);
  });

  it("given spearmen mirror below retreat threshold, routed/retreated/reversed booleans and empty set", () => {
    const full = rangedResolutionGameState();
    const event = generateResolveRangedAttackEvent(full, 0);
    expect(event.effectType).toBe("resolveRangedAttack");
    expect(event.defenderWithPlacement.unit.playerSide).toBe("white");
    expect(event.defenderWithPlacement.placement.coordinate).toBe("E-5");
    expect(typeof event.routed).toBe("boolean");
    expect(typeof event.retreated).toBe("boolean");
    expect(typeof event.reversed).toBe("boolean");
    expect(event.retreated).toBe(false);
    expect(event.legalRetreatOptions).toBeInstanceOf(Set);
    expect(event.legalRetreatOptions.size).toBe(0);
  });

  it("given defending commitment pending on ranged CRS, throws defending commitment guard", () => {
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
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      defendingCommitment: { commitmentType: "pending" },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full, 0)).toThrow(
      "Defending commitment is still pending",
    );
  });

  it("given attacking commitment pending on ranged CRS, throws attacking commitment guard", () => {
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
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackingCommitment: { commitmentType: "pending" },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full, 0)).toThrow(
      "Attacking commitment is still pending",
    );
  });

  it("given ranged CRS already holding attackApplyState, throws attack apply already exists", () => {
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
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackApplyState: createAttackApplyState(defendingUnit),
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full, 0)).toThrow(
      "Attack apply state already exists",
    );
  });
});
