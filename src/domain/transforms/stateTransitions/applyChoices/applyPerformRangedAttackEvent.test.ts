import type { StandardBoard, UnitInstance } from "@entities";
import type { PerformRangedAttackEventForBoard } from "@events";
import type { GameStateForBoard } from "@game";
import { getIssueCommandsPhaseState, getRangedAttackResolutionState } from "@queries";
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createUnitWithPlacement,
} from "@testing";
import { updatePhaseState } from "@transforms/pureTransforms";
import { isSameUnitInstance } from "@validation";
import { describe, expect, it } from "vitest";
import { applyPerformRangedAttackEvent } from "./applyPerformRangedAttackEvent";

/**
 * Starting a ranged resolution: CRS becomes rangedAttack with attacker/defender units, both
 * commitments pending, supporting units recorded, and every participating unit stripped from
 * the active player’s `remainingUnits*` (and defender from the opponent’s set when listed).
 */
describe("applyPerformRangedAttackEvent", () => {
  /** issueCommands at first or second resolve step with the given remaining unit sets. */
  function createStateInResolveStep(
    step: "firstPlayerResolveCommands" | "secondPlayerResolveCommands",
    remainingUnitsFirstPlayer: Set<UnitInstance>,
    remainingUnitsSecondPlayer: Set<UnitInstance>,
    currentInitiative: "black" | "white" = "black",
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        step,
        remainingUnitsFirstPlayer,
        remainingUnitsSecondPlayer,
      }),
    );
  }

  it("given sole black attacker vs white defender, ranged CRS pending both sides and first-player remaining empty", () => {
    const attacker = createUnitWithPlacement({
      coordinate: "E-5",
      facing: "north",
      playerSide: "black",
    });
    const defender = createUnitWithPlacement({
      coordinate: "E-7",
      facing: "south",
      playerSide: "white",
    });
    const state = createStateInResolveStep(
      "firstPlayerResolveCommands",
      new Set([attacker.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "performRangedAttack",
      boardType: "standard",
      player: "black",
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const ranged = getRangedAttackResolutionState(newState);

    expect(ranged.commandResolutionType).toBe("rangedAttack");
    expect(isSameUnitInstance(ranged.attackingUnit, attacker.unit).result).toBe(true);
    expect(isSameUnitInstance(ranged.defendingUnit, defender.unit).result).toBe(true);
    expect(ranged.attackingCommitment).toEqual({ commitmentType: "pending" });
    expect(ranged.defendingCommitment).toEqual({ commitmentType: "pending" });
    expect(ranged.supportingUnits.size).toBe(0);

    const remainingFirst = phaseState.remainingUnitsFirstPlayer;
    expect(remainingFirst.size).toBe(0);
    expect([...remainingFirst].some((u) => isSameUnitInstance(u, attacker.unit).result)).toBe(
      false,
    );
  });

  it("given two black units in remaining but only one attacks, other black stays in remaining", () => {
    const attacker = createUnitWithPlacement({
      coordinate: "E-5",
      facing: "north",
      playerSide: "black",
    });
    const otherUnit = createUnitWithPlacement({
      coordinate: "D-4",
      facing: "north",
      playerSide: "black",
      unitOptions: { instanceNumber: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: "E-7",
      facing: "south",
      playerSide: "white",
    });
    const state = createStateInResolveStep(
      "firstPlayerResolveCommands",
      new Set([attacker.unit, otherUnit.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "performRangedAttack",
      boardType: "standard",
      player: "black",
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const remainingFirst = phaseState.remainingUnitsFirstPlayer;

    expect(remainingFirst.size).toBe(1);
    expect([...remainingFirst].some((u) => isSameUnitInstance(u, otherUnit.unit).result)).toBe(
      true,
    );
    expect([...remainingFirst].some((u) => isSameUnitInstance(u, attacker.unit).result)).toBe(
      false,
    );
  });

  it("given defender listed in second-player remaining, after attack second-player remaining loses defender", () => {
    const attacker = createUnitWithPlacement({
      coordinate: "E-5",
      facing: "north",
      playerSide: "black",
    });
    const defender = createUnitWithPlacement({
      coordinate: "E-7",
      facing: "south",
      playerSide: "white",
    });
    const state = createStateInResolveStep(
      "firstPlayerResolveCommands",
      new Set([attacker.unit]),
      new Set([defender.unit]),
    );

    const event: PerformRangedAttackEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "performRangedAttack",
      boardType: "standard",
      player: "black",
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);

    expect(phaseState.remainingUnitsSecondPlayer.size).toBe(0);
    expect(
      [...phaseState.remainingUnitsSecondPlayer].some(
        (u) => isSameUnitInstance(u, defender.unit).result,
      ),
    ).toBe(false);
  });

  it("given attacker plus one supporter in remaining, both cleared and supporter in ranged.supportingUnits", () => {
    const attacker = createUnitWithPlacement({
      coordinate: "E-5",
      facing: "north",
      playerSide: "black",
    });
    const supporter = createUnitWithPlacement({
      coordinate: "D-5",
      facing: "north",
      playerSide: "black",
      unitOptions: { instanceNumber: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: "E-7",
      facing: "south",
      playerSide: "white",
    });
    const state = createStateInResolveStep(
      "firstPlayerResolveCommands",
      new Set([attacker.unit, supporter.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "performRangedAttack",
      boardType: "standard",
      player: "black",
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set([supporter]),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const ranged = getRangedAttackResolutionState(newState);

    expect(ranged.supportingUnits.size).toBe(1);
    expect(
      [...ranged.supportingUnits].some((u) => isSameUnitInstance(u, supporter.unit).result),
    ).toBe(true);
    expect(phaseState.remainingUnitsFirstPlayer.size).toBe(0);
  });

  it("given two supporters in remaining, ranged holds both and first-player remaining ends empty", () => {
    const attacker = createUnitWithPlacement({
      coordinate: "E-5",
      facing: "north",
      playerSide: "black",
    });
    const supporter1 = createUnitWithPlacement({
      coordinate: "D-5",
      facing: "north",
      playerSide: "black",
      unitOptions: { instanceNumber: 2 },
    });
    const supporter2 = createUnitWithPlacement({
      coordinate: "F-5",
      facing: "north",
      playerSide: "black",
      unitOptions: { instanceNumber: 3 },
    });
    const defender = createUnitWithPlacement({
      coordinate: "E-7",
      facing: "south",
      playerSide: "white",
    });
    const state = createStateInResolveStep(
      "firstPlayerResolveCommands",
      new Set([attacker.unit, supporter1.unit, supporter2.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "performRangedAttack",
      boardType: "standard",
      player: "black",
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set([supporter1, supporter2]),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const ranged = getRangedAttackResolutionState(newState);

    expect(ranged.supportingUnits.size).toBe(2);
    expect(phaseState.remainingUnitsFirstPlayer.size).toBe(0);
    expect(
      [...phaseState.remainingUnitsFirstPlayer].some(
        (u) => isSameUnitInstance(u, supporter1.unit).result,
      ),
    ).toBe(false);
    expect(
      [...phaseState.remainingUnitsFirstPlayer].some(
        (u) => isSameUnitInstance(u, supporter2.unit).result,
      ),
    ).toBe(false);
  });

  it("given secondPlayerResolveCommands with white attacker, second-player remaining cleared and ranged set", () => {
    const attacker = createUnitWithPlacement({
      coordinate: "E-6",
      facing: "south",
      playerSide: "white",
    });
    const defender = createUnitWithPlacement({
      coordinate: "E-4",
      facing: "north",
      playerSide: "black",
    });
    const state = createStateInResolveStep(
      "secondPlayerResolveCommands",
      new Set(),
      new Set([attacker.unit]),
      "black",
    );

    const event: PerformRangedAttackEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "performRangedAttack",
      boardType: "standard",
      player: "white",
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);

    expect(phaseState.remainingUnitsSecondPlayer.size).toBe(0);
    expect(getRangedAttackResolutionState(newState).attackingUnit).toBeDefined();
  });
});
