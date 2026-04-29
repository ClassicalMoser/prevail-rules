import type { Board } from "@entities";
import type { TriggerRoutFromRetreatEvent } from "@events";
import type { GameStateWithBoard, RoutState } from "@game";
import { RANGED_ATTACK_RESOLUTION_CONTEXT } from "@events";
import { getRetreatStateFromMelee, getRetreatStateFromRangedAttack } from "@queries";
import { updateRetreatRoutState } from "@transforms/pureTransforms";

/**
 * Applies a TriggerRoutFromRetreatEvent to the game state.
 * Creates a rout state in the retreat state when there are no legal retreat options.
 *
 * @param event - Resolution context from the procedure (trusted log payload)
 * @param state - The current game state
 * @returns A new game state with the rout state created in the retreat state
 */
export function applyTriggerRoutFromRetreatEvent<TBoard extends Board>(
  event: TriggerRoutFromRetreatEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const retreatState =
    event.retreatResolutionContext === RANGED_ATTACK_RESOLUTION_CONTEXT
      ? getRetreatStateFromRangedAttack(state)
      : getRetreatStateFromMelee(state, event.retreatingPlayer);

  const routState: RoutState = {
    substepType: "rout",
    player: retreatState.retreatingUnit.unit.playerSide,
    unitsToRout: new Set([retreatState.retreatingUnit.unit]),
    numberToDiscard: undefined,
    cardsChosen: false,
    completed: false,
  };

  return updateRetreatRoutState(state, routState);
}
