import type { StandardBoard, UnitWithPlacement } from "@entities";
import type { ResolveFlankEngagementEventForBoard } from "@events";
import type { GameStateForBoard } from "@game";
import { hasSingleUnit } from "@entities";
import { getBoardSpace } from "@queries";
import {
  createEmptyGameState,
  createFlankEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
} from "@testing";
import { addUnitToBoard, updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";

import { applyResolveFlankEngagementEvent } from "./applyResolveFlankEngagementEvent";

/**
 * Flank engagement resolution: rotates the defender on the board to `newFacing`, marks the
 * flank substep complete with `defenderRotated`, and finishes the movement engagement slice.
 */
describe("applyResolveFlankEngagementEvent", () => {
  it("given flank engagement and event newFacing south, board and engagement state reflect rotation and completion", () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit("white");
    const flank = createFlankEngagementState();
    const defenderWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: "standard" as const,
      unit: defender,
      placement: {
        boardType: "standard" as const,
        coordinate: flank.targetPlacement.coordinate,
        facing: "east",
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: flank.targetPlacement,
      engagementState: flank,
    });
    const full: GameStateForBoard<StandardBoard> = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );

    const event: ResolveFlankEngagementEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "gameEffect" as const,
      effectType: "resolveFlankEngagement" as const,
      boardType: "standard" as const,
      defenderWithPlacement,
      newFacing: "south",
    };

    const next = applyResolveFlankEngagementEvent(event, full);
    const space = getBoardSpace(next.boardState, flank.targetPlacement.coordinate);
    if (!hasSingleUnit(space.unitPresence)) {
      throw new Error("Expected single unit on defender space");
    }
    expect(space.unitPresence.facing).toBe("south");

    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== "issueCommands") {
      throw new Error("Expected issueCommands phase");
    }
    const cmd = phase.currentCommandResolutionState;
    if (cmd?.commandResolutionType !== "movement") throw new Error("movement");
    const es = cmd.engagementState;
    expect(es?.completed).toBe(true);
    if (es?.engagementResolutionState.engagementType !== "flank") {
      throw new Error("Expected flank");
    }
    expect(es.engagementResolutionState.defenderRotated).toBe(true);
  });
});
