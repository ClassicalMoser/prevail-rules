import type { Board } from "@entities";
import type { ResolveRoutEvent, RoutResolutionSource } from "@events";
import type { GameStateWithBoard, RoutState } from "@game";
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_ROUT_EFFECT_TYPE } from "@events";
import {
  getAttackApplyStateFromRangedAttack,
  getCurrentCommandResolutionState,
  getCurrentPhaseState,
  getRoutStateFromAttackApply,
  getRoutStateFromCleanupPhaseForResolveRout,
  getRoutStateFromMeleeResolutionByInitiative,
  getRoutStateFromRearEngagement,
} from "@queries";

/**
 * Generates a ResolveRoutEvent by calculating the rout penalty
 * for the unit(s) being routed.
 * The penalty is the sum of all units' routPenalty values.
 *
 * @param state - The current game state
 * @returns A complete ResolveRoutEvent with the routed unit and penalty
 * @throws Error if not in a valid state for rout resolution
 */
export function generateResolveRoutEvent<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  eventNumber: number,
): ResolveRoutEvent<TBoard, "resolveRout"> {
  const phaseState = getCurrentPhaseState(state);

  let routState: RoutState;
  let routResolutionSource: RoutResolutionSource;

  if (phaseState.phase === "issueCommands") {
    const crs = getCurrentCommandResolutionState(state);
    if (crs.commandResolutionType === "movement") {
      routState = getRoutStateFromRearEngagement(state);
      routResolutionSource = "rearEngagementMovement";
    } else if (crs.commandResolutionType === "rangedAttack") {
      routState = getRoutStateFromAttackApply(getAttackApplyStateFromRangedAttack(state));
      routResolutionSource = "rangedAttack";
    } else {
      throw new Error("Current command resolution is not movement or ranged attack");
    }
  } else if (phaseState.phase === "resolveMelee") {
    routState = getRoutStateFromMeleeResolutionByInitiative(state);
    routResolutionSource = "melee";
  } else if (phaseState.phase === "cleanup") {
    routState = getRoutStateFromCleanupPhaseForResolveRout(state);
    routResolutionSource = "rally";
  } else {
    throw new Error(`Rout resolution not expected in phase: ${phaseState.phase}`);
  }

  const totalPenalty = [...routState.unitsToRout].reduce(
    (sum, unit) => sum + unit.unitType.routPenalty,
    0,
  );

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_ROUT_EFFECT_TYPE,
    routResolutionSource,
    eventNumber,
    unitInstances: routState.unitsToRout,
    penalty: totalPenalty,
  };
}
