import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from "@testing";
import { describe, expect, it } from "vitest";
import {
  getCurrentCommandResolutionState,
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
} from "./getCommandResolutionState";

/**
 * Command-resolution accessors under issueCommands or resolveMelee: narrow CRS type, validate
 * pending commitments before strike calculation, and surface typed movement/ranged/melee slices.
 */
describe("getCurrentCommandResolutionState", () => {
  it("given issueCommands with movement CRS, returns movement commandResolutionType", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state),
    });

    const result = getCurrentCommandResolutionState(state);
    expect(result.commandResolutionType).toBe("movement");
  });

  it("given resolveMelee phase, throws not in issueCommands phase", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state);

    expect(() => getCurrentCommandResolutionState(state)).toThrow("Not in issueCommands phase");
  });

  it("given missing phase slice, throws not in issueCommands phase", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getCurrentCommandResolutionState(state)).toThrow("Not in issueCommands phase");
  });

  it("given issueCommands with undefined CRS, throws no current command resolution state", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(state);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      "No current command resolution state",
    );
  });
});

describe("getRangedAttackResolutionState", () => {
  it("given issueCommands with ranged CRS, returns attacker defender and ranged type", () => {
    const attackingUnit = createTestUnit("black", { attack: 2 });
    const defendingUnit = createTestUnit("white", { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state, {
        attackingUnit,
        defendingUnit,
      }),
    });

    const result = getRangedAttackResolutionState(state);
    expect(result.commandResolutionType).toBe("rangedAttack");
    expect(result.attackingUnit).toEqual(attackingUnit);
    expect(result.defendingUnit).toEqual(defendingUnit);
  });

  it("given movement CRS instead of ranged, throws current command resolution is not ranged attack", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state),
    });

    expect(() => getRangedAttackResolutionState(state)).toThrow(
      "Current command resolution is not a ranged attack",
    );
  });
});

describe("getMovementResolutionState", () => {
  it("given movement CRS with black mover on E-5 north, returns movement and that unit", () => {
    const movingUnit = createTestUnit("black", { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        movingUnit: {
          boardType: "standard" as const,
          unit: movingUnit,
          placement: {
            boardType: "standard" as const,
            coordinate: "E-5",
            facing: "north",
          },
        },
      }),
    });

    const result = getMovementResolutionState(state);
    expect(result.commandResolutionType).toBe("movement");
    expect(result.movingUnit.unit).toEqual(movingUnit);
  });

  it("given ranged CRS, throws current command resolution is not movement", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state),
    });

    expect(() => getMovementResolutionState(state)).toThrow(
      "Current command resolution is not a movement",
    );
  });
});

describe("getMeleeResolutionState", () => {
  it("given default resolveMelee factory, returns melee slice with both commitments completed", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state);

    const result = getMeleeResolutionState(state);
    expect(result.whiteCommitment.commitmentType).toBe("completed");
    expect(result.blackCommitment.commitmentType).toBe("completed");
  });

  it("given issueCommands phase, throws not in resolveMelee phase", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state),
    });

    expect(() => getMeleeResolutionState(state)).toThrow("Not in resolveMelee phase");
  });

  it("given missing phase slice, throws not in resolveMelee phase", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getMeleeResolutionState(state)).toThrow("Not in resolveMelee phase");
  });

  it("given resolveMelee with undefined currentMeleeResolutionState, throws no current melee resolution", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: undefined,
    });

    expect(() => getMeleeResolutionState(state)).toThrow("No current melee resolution state");
  });
});

describe("getMeleeResolutionReadyForAttackCalculation", () => {
  it("given default resolveMelee with completed commitments and no apply, returns melee at E-5", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state);

    const result = getMeleeResolutionReadyForAttackCalculation(state);
    expect(result.location).toBe("E-5");
  });

  it("given white commitment pending, throws white commitment is still pending", () => {
    const state = createEmptyGameState();
    const melee = createMeleeResolutionState(state, {
      whiteCommitment: { commitmentType: "pending" },
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: melee,
    });

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      "White commitment is still pending",
    );
  });

  it("given black commitment pending, throws black commitment is still pending", () => {
    const state = createEmptyGameState();
    const melee = createMeleeResolutionState(state, {
      blackCommitment: { commitmentType: "pending" },
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: melee,
    });

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      "Black commitment is still pending",
    );
  });

  it("given white attackApplyState already set, throws attack apply states already exist", () => {
    const state = createEmptyGameState();
    const unit = createTestUnit("white", { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(unit),
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: melee,
    });

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      "Attack apply states already exist",
    );
  });

  it("given black attackApplyState already set, throws attack apply states already exist", () => {
    const state = createEmptyGameState();
    const unit = createTestUnit("black", { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyState(unit),
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: melee,
    });

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      "Attack apply states already exist",
    );
  });
});
