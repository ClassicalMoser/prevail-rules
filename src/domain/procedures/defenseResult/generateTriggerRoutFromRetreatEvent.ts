import type { Board } from "@entities";
import type { TriggerRoutFromRetreatEvent } from "@events";
import type { GameStateForBoard } from "@game";
import { GAME_EFFECT_EVENT_TYPE, RANGED_ATTACK_RESOLUTION_CONTEXT } from "@events";
import {
  getCurrentPhaseStateForBoard,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from "@queries";

/**
 * Builds the trigger-rout-from-retreat effect with explicit resolution context
 * so apply does not branch on phase or probe players.
 */
export function generateTriggerRoutFromRetreatEvent<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  eventNumber: number,
): TriggerRoutFromRetreatEvent {
  const phaseState = getCurrentPhaseStateForBoard<TBoard>(state);

  if (phaseState.phase === "issueCommands") {
    getRetreatStateFromRangedAttack(state);
    return {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: "triggerRoutFromRetreat",
      retreatResolutionContext: RANGED_ATTACK_RESOLUTION_CONTEXT,
      eventNumber,
    };
  }

  if (phaseState.phase === "resolveMelee") {
    const firstPlayer = state.currentInitiative;
    const secondPlayer = firstPlayer === "white" ? "black" : "white";

    try {
      getRetreatStateFromMelee(state, firstPlayer);
      return {
        eventType: GAME_EFFECT_EVENT_TYPE,
        effectType: "triggerRoutFromRetreat",
        retreatResolutionContext: "melee",
        retreatingPlayer: firstPlayer,
        eventNumber,
      };
    } catch {
      getRetreatStateFromMelee(state, secondPlayer);
      return {
        eventType: GAME_EFFECT_EVENT_TYPE,
        effectType: "triggerRoutFromRetreat",
        retreatResolutionContext: "melee",
        retreatingPlayer: secondPlayer,
        eventNumber,
      };
    }
  }

  throw new Error(`Retreat rout not expected in phase: ${phaseState.phase}`);
}
