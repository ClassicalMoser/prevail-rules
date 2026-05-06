import type { ExpectedEventInfo } from "@events";
import type { EngagementState } from "@game";
import { getOtherPlayer } from "@queries/getOtherPlayer";
import { getExpectedRoutEvent } from ".";

/**
 * Gets the expected event for engagement resolution substeps.
 * This is a composable function that can be used in any context where
 * engagement state appears (movement resolution, etc.).
 *
 * @param engagementState - The engagement state, relevant to this engagement resolution
 * Prevents having to scan through phases to find the engagement state
 * @returns Information about what event is expected
 */
export function getExpectedEngagementEvent(engagementState: EngagementState): ExpectedEventInfo {
  const attackingPlayer = engagementState.engagingUnit.playerSide;
  const defendingPlayer = getOtherPlayer(attackingPlayer);

  const resolutionState = engagementState.engagementResolutionState;
  const engagementType = resolutionState.engagementType;
  // Check if engagement is completed (all work done, ready for parent to handle)
  if (engagementState.completed) {
    throw new Error("Engagement state is already complete");
  }

  if (engagementType === "flank") {
    // If the engagement is from the flank, we need to rotate the defending unit
    if (!resolutionState.defenderRotated) {
      // If the defending unit has not been rotated yet, we need to rotate it
      return {
        actionType: "gameEffect",
        effectType: "resolveFlankEngagement",
      };
    }
    // Defender rotated, flank engagement resolution should be complete
    // (but engagementState.completed should be set by the transform)
    throw new Error("Flank engagement resolution complete but not marked as completed");
  }
  if (engagementType === "rear") {
    // If the engagement is from the rear, we need to rout the defending unit
    // Check if rout is completed
    if (!resolutionState.routState.completed) {
      return getExpectedRoutEvent(resolutionState.routState);
    }
    // Rout is complete, check if rear engagement resolution is complete
    if (resolutionState.completed) {
      throw new Error("Rear engagement resolution state is already complete");
    }
    // Rear engagement resolution should be complete
    throw new Error("Rear engagement resolution complete but not advanced");
  }
  if (engagementType === "front") {
    // If the engagement is from the front,
    // we need to check if the defensive commitment has been resolved
    if (resolutionState.defensiveCommitment.commitmentType === "pending") {
      return {
        actionType: "playerChoice",
        playerSource: defendingPlayer,
        choiceType: "commitToMovement",
      };
    }
    // If the defensive commitment has been resolved,
    // we need to check if the defending unit can retreat
    if (resolutionState.defendingUnitCanRetreat === undefined) {
      return {
        actionType: "gameEffect",
        effectType: "resolveEngageRetreatOption",
      };
    }
    if (resolutionState.defendingUnitCanRetreat === false) {
      throw new Error("Defending unit cannot retreat");
    }
    // If the defending unit can retreat, we need to check if it has chosen to retreat
    if (resolutionState.defendingUnitRetreats === undefined) {
      return {
        actionType: "playerChoice",
        playerSource: defendingPlayer,
        choiceType: "chooseWhetherToRetreat",
      };
    }
    if (resolutionState.defendingUnitRetreats === false) {
      // Defending unit chose not to retreat, front engagement resolution should be complete
      // (but engagementState.completed should be set by the transform)
      throw new Error("Front engagement resolution complete but not marked as completed");
    }
    if (resolutionState.defendingUnitRetreated === undefined) {
      return {
        actionType: "playerChoice",
        playerSource: defendingPlayer,
        choiceType: "chooseRetreatOption",
      };
    }
    // Defending unit retreated, front engagement resolution should be complete
    // (but engagementState.completed should be set by the transform)
    throw new Error("Front engagement resolution complete but not marked as completed");
  }
  throw new Error("Invalid engagement type");
}
