import type { ValidationResult } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type { GameStateForVisibility, GameStateVisibility } from '@game';
import { isValidChooseCardEvent } from './isValidChooseCardEvent';
import { isValidChooseRallyEvent } from './isValidChooseRallyEvent';
import { isValidChooseRoutDiscardEvent } from './isValidChooseRoutDiscardEvent';
import { isValidChooseMeleeResolutionEvent } from './isValidMeleeResolutionEvent';
import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';

function legalChoiceNotImplemented(
  choiceType: PlayerChoiceType,
): ValidationResult {
  return {
    errorReason: `Legal validation not implemented for ${choiceType}`,
    result: false,
  };
}
/**
 * Validates that a player choice event is legal.
 *
 * @param event - The player choice event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the player choice event is legal
 */
export function validateLegalPlayerChoice<T extends GameStateVisibility>(
  event: PlayerChoiceEvent,
  state: GameStateForVisibility<T>,
): ValidationResult {
  // Legal validators currently assume authoritative card visibility (card `.id`).
  switch (event.choiceType) {
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
    case 'chooseRetreatOption':
    case 'chooseWhetherToRetreat':
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack':
    case 'issueCommand':
    case 'moveUnit':
    case 'performRangedAttack':
    case 'setupUnits': {
      return legalChoiceNotImplemented(event.choiceType);
    }
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
