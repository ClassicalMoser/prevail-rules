import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createIssueCommandsPhaseState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalIssueCommands } from './getLegalIssueCommands';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalIssueCommands: remaining command atoms for the active issue step.
 */
describe(getLegalIssueCommands, () => {
  it('returns remaining commands for the first player issue step', () => {
    const command = tempCommandCards[0].command;
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(getLegalIssueCommands(state)).toStrictEqual({
      commands: [command],
      player: 'black',
    });
  });

  it('returns null when not in an issue-commands step', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalIssueCommands(state)).toBeNull();
  });

  it('returns null when remaining commands are empty', () => {
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createIssueCommandsPhaseState(createEmptyGameState('standard'), {
        remainingCommandsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      }),
    );
    expect(getLegalIssueCommands(state)).toBeNull();
  });
});
