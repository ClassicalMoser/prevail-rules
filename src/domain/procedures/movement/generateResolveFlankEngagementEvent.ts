import type { Board, BoardCoordinate } from "@entities";
import type { ResolveFlankEngagementEvent } from "@events";
import type { GameStateWithBoard } from "@game";
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE } from "@events";
import {
  getFlankEngagementStateFromMovement,
  getOppositeFacing,
  getSingleUnitWithPlacementAtCoordinate,
} from "@queries";

/**
 * Generates a ResolveFlankEngagementEvent by calculating the new facing
 * for the defending unit in a flank engagement.
 * The defending unit is forced to rotate to face the engaging unit
 * (opposite of the engaging unit's facing).
 *
 * @param state - The current game state
 * @returns Event with `defenderWithPlacement` snapshot and computed `newFacing`
 * @throws Error if not in issueCommands phase, no movement resolution, or no engagement state
 */
export function generateResolveFlankEngagementEvent<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  eventNumber: number,
): ResolveFlankEngagementEvent<TBoard, "resolveFlankEngagement"> {
  const engagementState = getFlankEngagementStateFromMovement(state);

  const defenderWithPlacement = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate as BoardCoordinate<TBoard>,
  );

  // Get the engaging unit's facing
  const engagingFacing = engagementState.targetPlacement.facing;

  // Defending unit rotates to face the engaging unit (opposite of engaging unit's facing)
  const newFacing = getOppositeFacing(engagingFacing);

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
    eventNumber,
    boardType: state.boardState.boardType,
    defenderWithPlacement,
    newFacing,
  } as unknown as ResolveFlankEngagementEvent<TBoard, "resolveFlankEngagement">;
}
