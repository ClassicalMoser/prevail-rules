import type { ValidationResult } from '@utils';
import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { isValidAssignUnitSupportEvent } from './isValidAssignUnitSupportEvent';
import { isValidChooseCardEvent } from './isValidChooseCardEvent';
import { isValidChooseRallyEvent } from './isValidChooseRallyEvent';
import { isValidChooseRoutDiscardEvent } from './isValidChooseRoutDiscardEvent';
import { isValidChooseMeleeResolutionEvent } from './isValidMeleeResolutionEvent';
import { isValidChooseRetreatOptionEvent } from './isValidChooseRetreatOptionEvent';
import { isValidChooseWhetherToRetreatEvent } from './isValidChooseWhetherToRetreatEvent';
import { isValidCommitToMeleeEvent } from './isValidCommitToMeleeEvent';
import { isValidCommitToMovementEvent } from './isValidCommitToMovementEvent';
import { isValidCommitToRangedAttackEvent } from './isValidCommitToRangedAttackEvent';
import { isValidDoneIssuingCommandsEvent } from './isValidDoneIssuingCommandsEvent';
import { isValidIssueCommandEvent } from './isValidIssueCommandEvent';
import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';
import { isValidMoveUnitEvent } from './isValidMoveUnitEvent';
import { isValidPerformRangedAttackEvent } from './isValidPerformRangedAttackEvent';
import { isValidSetupUnitsEvent } from './isValidSetupUnitsEvent';

/**
 * Validates that a player choice event is legal under the rules by checking
 * membership against the legality layer's enumerated options (where available).
 *
 * @param event - The player choice event to validate
 * @param state - The current authoritative game state
 * @returns ValidationResult indicating if the player choice event is legal
 */
export function validateLegalPlayerChoice(
  event: PlayerChoiceEvent,
  state: GameState,
): ValidationResult {
  switch (event.choiceType) {
    case 'assignUnitSupport': {
      return isValidAssignUnitSupportEvent(event, state);
    }
    case 'chooseCard': {
      return isValidChooseCardEvent(event, state);
    }
    case 'chooseMeleeResolution': {
      return isValidChooseMeleeResolutionEvent(event, state);
    }
    case 'moveCommander': {
      return isValidMoveCommanderEvent(event, state);
    }
    case 'chooseRally': {
      return isValidChooseRallyEvent(event, state);
    }
    case 'chooseRoutDiscard': {
      return isValidChooseRoutDiscardEvent(event, state);
    }
    case 'chooseRetreatOption': {
      return isValidChooseRetreatOptionEvent(event, state);
    }
    case 'chooseWhetherToRetreat': {
      return isValidChooseWhetherToRetreatEvent(event, state);
    }
    case 'commitToMelee': {
      return isValidCommitToMeleeEvent(event, state);
    }
    case 'commitToMovement': {
      return isValidCommitToMovementEvent(event, state);
    }
    case 'commitToRangedAttack': {
      return isValidCommitToRangedAttackEvent(event, state);
    }
    case 'moveUnit': {
      return isValidMoveUnitEvent(event, state);
    }
    case 'doneIssuingCommands': {
      return isValidDoneIssuingCommandsEvent(event, state);
    }
    case 'issueCommand': {
      return isValidIssueCommandEvent(event, state);
    }
    case 'setupUnits': {
      return isValidSetupUnitsEvent(event, state);
    }
    case 'performRangedAttack': {
      return isValidPerformRangedAttackEvent(event, state);
    }
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
