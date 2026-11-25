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
  applyCommitToRangedDefenseEvent,
  applyIssueCommandsEvent,
  applyMoveCommanderEvent,
  applyChooseMovingUnitEvent,
  applyMoveUnitEvent,
  applyChooseShooterEvent,
  applyPerformRangedAttackEvent,
  applySetupUnitsEvent,
} from './applyChoices';

/**
 * Routes player choice events to their corresponding apply functions.
 *
 * Most choices assume `event.player` is owned under the state's visibility
 * (enforced inside card-touching applies via getOwned/getHidden helpers).
 * {@link applyChooseCardEvent} also accepts a projected opponent chooseCard
 * (`card: 'hidden'`). Commits keep the real card.
 *
 * A choice reaches here once `validatePlayerChoice` has accepted it, or as a
 * seat's view of a choice the record already holds; the rule for that kind of
 * choice carries it out without asking again whether it was legal.
 * `applyEvent` is the one caller.
 *
 * @param event - The choice a player made, or its projection for a seat
 * @param state - The game the choice was made in, under any visibility
 * @returns The game with that choice carried out, under the same visibility
 * @throws Error when the choice is of no kind the game knows
 */
export function applyPlayerChoiceEvent<S extends GameState>(
  event: PlayerChoiceEvent | ProjectedPlayerChoiceEvent,
  state: S,
): S {
  // Each kind of choice has one rule that carries it out, and the choice's
  // own kind picks it.
  switch (event.choiceType) {
    case 'assignUnitSupport': {
      return applyAssignUnitSupportEvent(event, state);
    }
    case 'chooseCard': {
      // The one choice a seat may fold in projected: the opponent's card is
      // laid face down, so the seat sees only that one was chosen (§4.1.1).
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
    case 'commitToRangedDefense': {
      return applyCommitToRangedDefenseEvent(event, state);
    }
    case 'issueCommands': {
      return applyIssueCommandsEvent(event, state);
    }
    case 'moveCommander': {
      return applyMoveCommanderEvent(event, state);
    }
    case 'chooseMovingUnit': {
      return applyChooseMovingUnitEvent(event, state);
    }
    case 'moveUnit': {
      return applyMoveUnitEvent(event, state);
    }
    case 'chooseShooter': {
      return applyChooseShooterEvent(event, state);
    }
    case 'performRangedAttack': {
      return applyPerformRangedAttackEvent(event, state);
    }
    case 'setupUnits': {
      return applySetupUnitsEvent(event, state);
    }
    default: {
      // Adding a kind of choice without routing it fails to compile here.
      const _exhaustive: never = event;

      // Only a choice forged past its type reaches here; the refusal names
      // the kind it claimed.
      throw new Error(
        `Unknown player choice event type: ${(_exhaustive as PlayerChoiceEvent).choiceType}`,
      );
    }
  }
}
