import type { Board } from "@entities";
import type { CompleteResolveMeleePhaseEvent } from "@events";
import type { GameStateWithBoard } from "@game";
import { COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from "@events";

/**
 * Generates a CompleteResolveMeleePhaseEvent to complete the resolve melee phase
 * and advance to cleanup phase.
 *
 * @param state - The current game state
 * @returns A complete CompleteResolveMeleePhaseEvent
 */
export function generateCompleteResolveMeleePhaseEvent<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  eventNumber: number,
): CompleteResolveMeleePhaseEvent<TBoard, "completeResolveMeleePhase"> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
    eventNumber,
  };
}
