/**
 * Routes player choice events to their corresponding apply functions.
 */

import type { PlayerChoiceEvent } from '@events';
import type { GameState, OwnedPlayerForGameState } from '@game';
import {
  applyChooseCardEvent,
  applyChooseMeleeEvent,
  applyChooseRallyEvent,
  applyChooseRetreatOptionEvent,
  applyChooseRoutDiscardEvent,
  applyChooseWhetherToRetreatEvent,
  applyCommitToMeleeEvent,
  applyCommitToMovementEvent,
  applyCommitToRangedAttackEvent,
  applyIssueCommandEvent,
  applyMoveCommanderEvent,
  applyMoveUnitEvent,
  applyPerformRangedAttackEvent,
  applySetupUnitsEvent,
} from './applyChoices';

/**
 * Routes player choice events to their corresponding apply functions.
 * `event.player` must be owned under game state `S`.
 */
export function applyPlayerChoiceEvent<S extends GameState>(
  event: PlayerChoiceEvent & { player: OwnedPlayerForGameState<S> },
  state: S,
): S {
  switch (event.choiceType) {
    case 'chooseCard': {
      return applyChooseCardEvent(event, state);
    }
    case 'chooseMeleeResolution': {
      return applyChooseMeleeEvent(event, state);
    }
    case 'chooseRally': {
      return applyChooseRallyEvent(event, state);
    }
    case 'chooseRetreatOption': {
      return applyChooseRetreatOptionEvent(event, state);
    }
    case 'chooseRoutDiscard': {
      return applyChooseRoutDiscardEvent(event, state);
    }
    case 'chooseWhetherToRetreat': {
      return applyChooseWhetherToRetreatEvent(event, state);
    }
    case 'commitToMelee': {
      return applyCommitToMeleeEvent(event, state);
    }
    case 'commitToMovement': {
      return applyCommitToMovementEvent(event, state);
    }
    case 'commitToRangedAttack': {
      return applyCommitToRangedAttackEvent(event, state);
    }
    case 'issueCommand': {
      return applyIssueCommandEvent(event, state);
    }
    case 'moveCommander': {
      return applyMoveCommanderEvent(event, state);
    }
    case 'moveUnit': {
      return applyMoveUnitEvent(event, state);
    }
    case 'performRangedAttack': {
      return applyPerformRangedAttackEvent(event, state);
    }
    case 'setupUnits': {
      return applySetupUnitsEvent(event, state);
    }
    default: {
      const _exhaustive: never = event;
      throw new Error(
        `Unknown player choice event type: ${(_exhaustive as PlayerChoiceEvent).choiceType}`,
      );
    }
  }
}
