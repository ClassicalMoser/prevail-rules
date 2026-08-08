/**
 * Routes player choice events to their corresponding apply functions.
 */

import type {
  PlayerChoiceEvent,
  ProjectedPlayerChoiceEvent,
} from '@events';
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
 *
 * For most choices, `event.player` must be owned under game state `S`.
 * {@link applyChooseCardEvent} also accepts projected opponent choices on seen views.
 */
export function applyPlayerChoiceEvent<S extends GameState>(
  event: PlayerChoiceEvent | ProjectedPlayerChoiceEvent,
  state: S,
): S {
  switch (event.choiceType) {
    case 'chooseCard': {
      return applyChooseCardEvent(event, state);
    }
    case 'chooseMeleeResolution': {
      return applyChooseMeleeEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'chooseRally': {
      return applyChooseRallyEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'chooseRetreatOption': {
      return applyChooseRetreatOptionEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'chooseRoutDiscard': {
      return applyChooseRoutDiscardEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'chooseWhetherToRetreat': {
      return applyChooseWhetherToRetreatEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'commitToMelee': {
      return applyCommitToMeleeEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'commitToMovement': {
      return applyCommitToMovementEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'commitToRangedAttack': {
      return applyCommitToRangedAttackEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'issueCommand': {
      return applyIssueCommandEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'moveCommander': {
      return applyMoveCommanderEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'moveUnit': {
      return applyMoveUnitEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'performRangedAttack': {
      return applyPerformRangedAttackEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    case 'setupUnits': {
      return applySetupUnitsEvent(
        event as typeof event & { player: OwnedPlayerForGameState<S> },
        state,
      );
    }
    default: {
      const _exhaustive: never = event;
      throw new Error(
        `Unknown player choice event type: ${(_exhaustive as PlayerChoiceEvent).choiceType}`,
      );
    }
  }
}
