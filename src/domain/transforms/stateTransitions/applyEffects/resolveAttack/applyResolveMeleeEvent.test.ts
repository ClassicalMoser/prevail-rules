import type { StandardBoard, UnitWithPlacement } from "@entities";
import type { ResolveMeleeEvent } from "@events";
import type { StandardGameState } from "@game";
import { getMeleeResolutionState } from "@queries";
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
} from "@testing";
import { updateCardState, updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";

import { applyResolveMeleeEvent } from "./applyResolveMeleeEvent";

/**
 * Materializes procedure `resolveMelee` into per-side `attackApplyState` substeps (rout,
 * retreat with optional auto final hex, reverse) or clears applies when nothing branches.
 */
describe("applyResolveMeleeEvent", () => {
  /** resolveMelee phase with default melee CRS and both inPlay command cards set. */
  function baseMeleeGameState(): StandardGameState {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const melee = createMeleeResolutionState(withCards);
    return updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  /** Mirror engaged pair on E-5 for event payloads. */
  function unitPlacements(): {
    whiteUnitWithPlacement: UnitWithPlacement<StandardBoard>;
    blackUnitWithPlacement: UnitWithPlacement<StandardBoard>;
  } {
    const whiteUnit = createTestUnit("white", { attack: 2 });
    const blackUnit = createTestUnit("black", { attack: 2 });
    return {
      whiteUnitWithPlacement: {
        boardType: "standard" as const,
        unit: whiteUnit,
        placement: {
          boardType: "standard" as const,
          coordinate: "E-5",
          facing: "north",
        },
      },
      blackUnitWithPlacement: {
        boardType: "standard" as const,
        unit: blackUnit,
        placement: {
          boardType: "standard" as const,
          coordinate: "E-5",
          facing: "south",
        },
      },
    };
  }

  /** Neutral resolveMelee event: no rout/retreat/reverse, empty legal retreat sets. */
  function baseMeleeEvent(
    placements: ReturnType<typeof unitPlacements>,
  ): ResolveMeleeEvent<StandardBoard> {
    return {
      eventNumber: 0,
      eventType: "gameEffect",
      effectType: "resolveMelee",
      boardType: "standard",
      location: "E-5",
      whiteUnitWithPlacement: placements.whiteUnitWithPlacement,
      blackUnitWithPlacement: placements.blackUnitWithPlacement,
      whiteLegalRetreatOptions: new Set(),
      blackLegalRetreatOptions: new Set(),
      whiteUnitRouted: false,
      blackUnitRouted: false,
      whiteUnitRetreated: false,
      blackUnitRetreated: false,
      whiteUnitReversed: false,
      blackUnitReversed: false,
    };
  }

  it("given flat melee outcome flags, neither side gets an attackApplyState", () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event = baseMeleeEvent(placements);

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState).toBeUndefined();
    expect(melee.blackAttackApplyState).toBeUndefined();
  });

  it("given whiteUnitReversed true, white apply gains reverse substep and black stays undefined", () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteUnitReversed: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState?.reverseState?.substepType).toBe("reverse");
    expect(melee.blackAttackApplyState).toBeUndefined();
  });

  it("given whiteUnitRouted true, white apply gains rout substep", () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteUnitRouted: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState?.routState?.substepType).toBe("rout");
    expect(melee.blackAttackApplyState).toBeUndefined();
  });

  it("given white retreated with one legal hex E-6 south, retreat finalPosition auto-fills", () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const only = {
      boardType: "standard" as const,
      coordinate: "E-6" as const,
      facing: "south" as const,
    };
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteLegalRetreatOptions: new Set([only]),
      whiteUnitRetreated: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState?.retreatState?.finalPosition).toEqual(only);
  });

  it("given white retreated with two legal hexes, retreat finalPosition stays undefined", () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteLegalRetreatOptions: new Set([
        { boardType: "standard" as const, coordinate: "E-6", facing: "south" },
        { boardType: "standard" as const, coordinate: "E-4", facing: "south" },
      ]),
      whiteUnitRetreated: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState?.retreatState?.finalPosition).toBeUndefined();
  });
});
