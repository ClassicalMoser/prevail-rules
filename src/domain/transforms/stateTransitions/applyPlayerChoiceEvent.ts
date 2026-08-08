/**
 * Routes player choice events to their corresponding apply functions.
 */

import type {
  AssignUnitSupportEvent,
  ChooseMeleeResolutionEvent,
  ChooseRallyEvent,
  ChooseRetreatOptionEvent,
  ChooseRoutDiscardEvent,
  ChooseWhetherToRetreatEvent,
  CommitToMeleeEvent,
  CommitToMovementEvent,
  CommitToRangedAttackEvent,
  DoneIssuingCommandsEvent,
  IssueCommandEvent,
  MoveCommanderEvent,
  MoveUnitEvent,
  PerformRangedAttackEvent,
  PlayerChoiceEvent,
  ProjectedPlayerChoiceEvent,
  SetupUnitsEvent,
} from '@events';
import type { GameState, OwnedPlayerForGameState } from '@game';
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

type OwnedChoice<E, S extends GameState> = E & {
  player: OwnedPlayerForGameState<S>;
};

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
    case 'assignUnitSupport': {
      return applyAssignUnitSupportEvent(
        event as OwnedChoice<AssignUnitSupportEvent, S>,
        state,
      );
    }
    case 'chooseCard': {
      return applyChooseCardEvent(event, state);
    }
    case 'chooseMeleeResolution': {
      return applyChooseMeleeEvent(
        event as OwnedChoice<ChooseMeleeResolutionEvent, S>,
        state,
      );
    }
    case 'chooseRally': {
      return applyChooseRallyEvent(
        event as OwnedChoice<ChooseRallyEvent, S>,
        state,
      );
    }
    case 'chooseRetreatOption': {
      return applyChooseRetreatOptionEvent(
        event as OwnedChoice<ChooseRetreatOptionEvent, S>,
        state,
      );
    }
    case 'chooseRoutDiscard': {
      return applyChooseRoutDiscardEvent(
        event as OwnedChoice<ChooseRoutDiscardEvent, S>,
        state,
      );
    }
    case 'chooseWhetherToRetreat': {
      return applyChooseWhetherToRetreatEvent(
        event as OwnedChoice<ChooseWhetherToRetreatEvent, S>,
        state,
      );
    }
    case 'commitToMelee': {
      return applyCommitToMeleeEvent(
        event as OwnedChoice<CommitToMeleeEvent, S>,
        state,
      );
    }
    case 'commitToMovement': {
      return applyCommitToMovementEvent(
        event as OwnedChoice<CommitToMovementEvent, S>,
        state,
      );
    }
    case 'commitToRangedAttack': {
      return applyCommitToRangedAttackEvent(
        event as OwnedChoice<CommitToRangedAttackEvent, S>,
        state,
      );
    }
    case 'doneIssuingCommands': {
      return applyDoneIssuingCommandsEvent(
        event as OwnedChoice<DoneIssuingCommandsEvent, S>,
        state,
      );
    }
    case 'issueCommand': {
      return applyIssueCommandEvent(
        event as OwnedChoice<IssueCommandEvent, S>,
        state,
      );
    }
    case 'moveCommander': {
      return applyMoveCommanderEvent(
        event as OwnedChoice<MoveCommanderEvent, S>,
        state,
      );
    }
    case 'moveUnit': {
      return applyMoveUnitEvent(event as OwnedChoice<MoveUnitEvent, S>, state);
    }
    case 'performRangedAttack': {
      return applyPerformRangedAttackEvent(
        event as OwnedChoice<PerformRangedAttackEvent, S>,
        state,
      );
    }
    case 'setupUnits': {
      return applySetupUnitsEvent(
        event as OwnedChoice<SetupUnitsEvent, S>,
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
