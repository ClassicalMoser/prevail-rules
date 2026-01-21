/**
 * Routes player choice events to their corresponding apply functions.
 */

import type { Board, GameState } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import {
  applyChooseCardEvent,
  applyChooseMeleeEvent,
  applyChooseRallyEvent,
  applyChooseRoutDiscardEvent,
  applyMoveCommanderEvent,
  applyMoveUnitEvent,
  applySetupUnitsEvent,
} from './stateTransitions';

/**
 * Routes player choice events to their corresponding apply functions.
 */
export function applyPlayerChoiceEvent<TBoard extends Board>(
  event: PlayerChoiceEvent<TBoard, PlayerChoiceType>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  switch (event.choiceType) {
    case 'chooseCard':
      return applyChooseCardEvent(event, state);
    case 'chooseMeleeResolution':
      return applyChooseMeleeEvent(event, state);
    case 'chooseRally':
      return applyChooseRallyEvent(event, state);
    case 'chooseRoutDiscard':
      return applyChooseRoutDiscardEvent(event, state);
    case 'moveCommander':
      return applyMoveCommanderEvent(event, state);
    case 'moveUnit':
      return applyMoveUnitEvent(event, state);
    case 'setupUnits':
      return applySetupUnitsEvent(event, state);
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack':
    case 'issueCommand':
    case 'performRangedAttack':
      throw new Error(
        `Event type ${event.choiceType} is not yet implemented in the transform engine`,
      );
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = event;
      throw new Error(
        `Unknown player choice event type: ${(_exhaustive as PlayerChoiceEvent<TBoard, PlayerChoiceType>).choiceType}`,
      );
    }
  }
}
