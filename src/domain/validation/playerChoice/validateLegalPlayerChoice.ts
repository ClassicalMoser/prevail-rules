import type { ValidationResult } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type { GameState, GameStateForVisibility } from '@game';
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
export function validateLegalPlayerChoice(
  event: PlayerChoiceEvent,
  state: GameState,
): ValidationResult {
  // Legal validators currently assume authoritative card visibility (card `.id`).
  const authoritativeState = state as GameStateForVisibility<'authoritative'>;
  switch (event.choiceType) {
    case 'chooseCard': {
      return isValidChooseCardEvent(event, authoritativeState);
    }
    case 'chooseMeleeResolution': {
      return isValidChooseMeleeResolutionEvent(event, authoritativeState);
    }
    case 'moveCommander': {
      return isValidMoveCommanderEvent(event, authoritativeState);
    }
    case 'chooseRally': {
      return isValidChooseRallyEvent(event, authoritativeState);
    }
    case 'chooseRoutDiscard': {
      return isValidChooseRoutDiscardEvent(event, authoritativeState);
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
