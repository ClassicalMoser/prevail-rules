import { getSpacesWithinDistance } from "src/functions/boardSpace/areas/getSpacesWithinDistance.js";
import { getBoardSpace } from "src/functions/boardSpace/getBoardSpace.js";
import { COMMANDER_MOVE_DISTANCE } from "src/sampleValues/ruleValues.js";
export function isLegalCommanderMove(moveCommanderCommand, boardState) {
    const { player, from, to } = moveCommanderCommand;
    // Validate that the commander is at the starting position
    try {
        const fromSpace = getBoardSpace(boardState, from);
        // Check if the player's commander is actually at the starting position
        if (!fromSpace.commanders.has(player)) {
            return false;
        }
    }
    catch {
        // Invalid starting coordinate
        return false;
    }
    // Validate that the destination is within the commander's move distance
    const spacesWithinDistance = getSpacesWithinDistance(boardState, from, COMMANDER_MOVE_DISTANCE);
    return spacesWithinDistance.has(to);
}
