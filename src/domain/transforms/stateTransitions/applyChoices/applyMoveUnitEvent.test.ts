import type { StandardBoard } from "@entities";
import type { MoveUnitEventForBoard } from "@events";
import { createEmptyGameState, createUnitWithPlacement } from "@testing";
import { addUnitToBoard, updateBoardState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";
import { applyMoveUnitEvent } from "./applyMoveUnitEvent";

/**
 * During command resolution, a commanded unit’s `moveUnit` choice rewrites board presence:
 * source hex clears to none, destination gets the same unit instance with new facing.
 */
describe("applyMoveUnitEvent", () => {
  it("given black unit E-5 north and event to E-7 north, E-5 empty and E-7 holds that unit north", () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: "E-5",
      facing: "north",
      playerSide: "black",
    });
    const state = createEmptyGameState();
    const boardWithUnit = addUnitToBoard(state.boardState, unitWithPlacement);
    const stateWithUnit = updateBoardState(state, boardWithUnit);

    const event: MoveUnitEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "moveUnit",
      boardType: "standard",
      player: "black",
      unit: unitWithPlacement,
      to: {
        boardType: "standard" as const,
        coordinate: "E-7",
        facing: "north",
      },
      moveCommander: false,
    };

    const newState = applyMoveUnitEvent(event, stateWithUnit);

    expect(newState.boardState.board["E-5"]?.unitPresence.presenceType).toBe("none");
    expect(newState.boardState.board["E-7"]?.unitPresence).toBeDefined();
    const presence = newState.boardState.board["E-7"]?.unitPresence;
    if (presence?.presenceType !== "single") throw new Error("Expected single unit");
    expect(presence.unit.playerSide).toBe("black");
    expect(presence.facing).toBe("north");
  });
});
