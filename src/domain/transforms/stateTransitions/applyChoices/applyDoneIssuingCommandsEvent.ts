import type { DoneIssuingCommandsEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a DoneIssuingCommandsEvent: clears that player's remaining command
 * slots and advances to their resolve-commands step, seeding remaining units
 * from units already commanded this round.
 */
export function applyDoneIssuingCommandsEvent<S extends GameState>(
  event: DoneIssuingCommandsEvent,
  state: S,
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const { player } = event;
  const isFirstPlayer = player === state.currentInitiative;
  const remainingUnits = state.currentRoundState.commandedUnits.filter(
    (unit) => unit.playerSide === player,
  );

  let newPhaseState: IssueCommandsPhaseState;
  if (isFirstPlayer && phaseState.step === 'firstPlayerIssueCommands') {
    newPhaseState = {
      ...phaseState,
      remainingCommandsFirstPlayer: [],
      remainingUnitsFirstPlayer: remainingUnits,
      step: 'firstPlayerResolveCommands',
    };
  } else if (
    !isFirstPlayer &&
    phaseState.step === 'secondPlayerIssueCommands'
  ) {
    newPhaseState = {
      ...phaseState,
      remainingCommandsSecondPlayer: [],
      remainingUnitsSecondPlayer: remainingUnits,
      step: 'secondPlayerResolveCommands',
    };
  } else {
    throw new Error(
      `doneIssuingCommands is not valid on step ${phaseState.step} for ${player}`,
    );
  }

  return updatePhaseState(state, newPhaseState);
}
