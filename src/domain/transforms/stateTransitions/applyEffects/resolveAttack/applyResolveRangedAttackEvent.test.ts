import type { StandardBoard, UnitInstance, UnitPlacement, UnitWithPlacement } from "@entities";
import type { ResolveRangedAttackEventForBoard } from "@events";
import type { GameStateForBoard } from "@game";
import { getRangedAttackResolutionState } from "@queries";
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createTestUnit,
} from "@testing";
import { updateCardState, updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";

import { applyResolveRangedAttackEvent } from "./applyResolveRangedAttackEvent";

/**
 * First strike resolution: builds `attackApplyState` on the ranged CRS from procedure flags—
 * attack result, optional rout / retreat (auto hex when unique) / reverse substeps.
 */
describe("applyResolveRangedAttackEvent", () => {
  /** issueCommands + ranged CRS with white defender on E-5 and both inPlay cards. */
  function createRangedResolutionFixture(): {
    full: GameStateForBoard<StandardBoard>;
    defender: UnitInstance;
    defenderWithPlacement: UnitWithPlacement<StandardBoard>;
  } {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const defender = createTestUnit("white", { attack: 2 });
    const defenderWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: defender,
      placement: {
        boardType: "standard" as const,
        coordinate: "E-5",
        facing: "north",
      },
    };
    const ranged = createRangedAttackResolutionState(withCards, {
      defendingUnit: defender,
    });
    const full = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
    return { full, defender, defenderWithPlacement };
  }

  type RangedEventPatch = Partial<
    Omit<
      ResolveRangedAttackEventForBoard<StandardBoard>,
      "defenderWithPlacement" | "eventType" | "effectType"
    >
  > &
    Pick<ResolveRangedAttackEventForBoard<StandardBoard>, "legalRetreatOptions">;

  /** Game effect merge: defaults plus patch (legalRetreatOptions required in patch). */
  function rangedEvent(
    defenderWithPlacement: UnitWithPlacement<StandardBoard>,
    patch: RangedEventPatch,
  ): ResolveRangedAttackEventForBoard<StandardBoard> {
    return {
      eventNumber: 0,
      eventType: "gameEffect",
      effectType: "resolveRangedAttack",
      boardType: "standard",
      defenderWithPlacement,
      routed: false,
      retreated: false,
      reversed: false,
      ...patch,
    };
  }

  it("given no branch flags and empty legal retreats, attackApply has no rout retreat reverse substeps", () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set(),
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.routState).toBeUndefined();
    expect(ra.attackApplyState?.retreatState).toBeUndefined();
    expect(ra.attackApplyState?.reverseState).toBeUndefined();
  });

  it("given reversed true, attackResult unitReversed and reverse substep present", () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set(),
      reversed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.attackResult.unitReversed).toBe(true);
    expect(ra.attackApplyState?.reverseState?.substepType).toBe("reverse");
  });

  it("given routed true, rout substep lists defending unit instance", () => {
    const { full, defender, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set(),
      routed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.routState?.substepType).toBe("rout");
    expect(ra.attackApplyState?.routState?.unitsToRout.has(defender)).toBe(true);
  });

  it("given retreated with sole legal E-6 south, retreat finalPosition equals that placement", () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const onlyOption = {
      boardType: "standard" as const,
      coordinate: "E-6" as const,
      facing: "south" as const,
    };
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set([onlyOption]),
      retreated: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.retreatState?.finalPosition).toEqual(onlyOption);
  });

  it.each<{
    description: string;
    legalRetreatOptions: Set<UnitPlacement<StandardBoard>>;
  }>([
    {
      description: "multiple legal retreats",
      legalRetreatOptions: new Set([
        { boardType: "standard" as const, coordinate: "E-6", facing: "south" },
        { boardType: "standard" as const, coordinate: "E-4", facing: "south" },
      ]),
    },
    {
      description: "no legal retreat options",
      legalRetreatOptions: new Set(),
    },
  ])(
    "given retreated true and $description, retreat finalPosition is undefined",
    ({ legalRetreatOptions }) => {
      const { full, defenderWithPlacement } = createRangedResolutionFixture();
      const event = rangedEvent(defenderWithPlacement, {
        legalRetreatOptions,
        retreated: true,
      });

      const next = applyResolveRangedAttackEvent(event, full);
      const ra = getRangedAttackResolutionState(next);
      expect(ra.attackApplyState?.retreatState?.finalPosition).toBeUndefined();
    },
  );
});
