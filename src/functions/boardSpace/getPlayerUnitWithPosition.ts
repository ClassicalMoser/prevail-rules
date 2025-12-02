import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitWithPlacement } from "src/entities/index.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import { getOppositeFacing } from "../facings/getOppositeFacing.js";
import { getBoardSpace } from "./getBoardSpace.js";

/**
 * Extracts the friendly unit and its placement from a board space for a given player side.
 *
 * @param board - The board to check
 * @param coordinate - The coordinate of the board space
 * @param playerSide - The player side to find a friendly unit for
 * @returns A UnitWithPlacement if a friendly unit is found, or undefined if not
 */
export function getPlayerUnitWithPosition<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  playerSide: PlayerSide
): UnitWithPlacement<TBoard> | undefined {
  const unitPresence = getBoardSpace(board, coordinate).unitPresence;

  // If there's no unit, return undefined
  if (unitPresence.presenceType === "none") {
    return undefined;
  }

  // Handle single unit presence
  if (unitPresence.presenceType === "single") {
    if (unitPresence.unit.playerSide === playerSide) {
      return {
        unit: unitPresence.unit,
        placement: {
          coordinate,
          facing: unitPresence.facing,
        },
      };
    }
    // Enemy unit - return undefined
    return undefined;
  }

  // Handle engaged unit presence
  else {
    // Check primary unit first
    if (unitPresence.primaryUnit.playerSide === playerSide) {
      return {
        unit: unitPresence.primaryUnit,
        placement: {
          coordinate,
          facing: unitPresence.primaryFacing,
        },
      };
    }
    // If the primary unit is not friendly, the secondary unit must be.
    // (There are only two sides, and friendly units cannot engage each other)
    else {
      return {
        unit: unitPresence.secondaryUnit,
        placement: {
          coordinate,
          facing: getOppositeFacing(unitPresence.primaryFacing),
        },
      };
    }
  }
}
