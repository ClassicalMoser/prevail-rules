/**
 * Routes player choice events to their corresponding apply functions.
 */

import type { PlayerChoiceEvent, ProjectedPlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import {
  applyAssignUnitSupportEvent,
  applyChooseCardEvent,
  applyChooseMeleeEvent,
  applyChooseRallyEvent,
  applyChooseRetreatOptionEvent,
  applyChooseRoutDiscardEvent,
  applyChooseWhetherToRetreatEvent,
  applyCommitToMeleeEvent,
  applyCommitToMovementEvent,
  applyCommitToRangedAttackEvent,
  applyDoneIssuingCommandsEvent,
  applyIssueCommandEvent,
  applyMoveCommanderEvent,
  applyMoveUnitEvent,
  applyPerformRangedAttackEvent,
  applySetupUnitsEvent,
} from './applyChoices';

/**
 * Routes player choice events to their corresponding apply functions.
 *
 * Most choices assume `event.player` is owned under the state's visibility
 * (enforced inside card-touching applies via getOwned/getHidden helpers).
 * {@link applyChooseCardEvent} and commit applies also accept projected opponent
 * choices on seen views (`card` / `committedCard: 'hidden'`).
 */
export function applyPlayerChoiceEvent<S extends GameState>(
  event: PlayerChoiceEvent | ProjectedPlayerChoiceEvent,
  state: S,
): S {
  switch (event.choiceType) {
    case 'assignUnitSupport': {
      return applyAssignUnitSupportEvent(event, state);
    }
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
    case 'doneIssuingCommands': {
      return applyDoneIssuingCommandsEvent(event, state);
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
